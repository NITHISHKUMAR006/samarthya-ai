import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles, Send, X, Bot, User, BookOpen, Target, CheckCircle2,
  RefreshCw, Cpu, Settings, ChevronDown, ChevronUp, Check, AlertCircle,
  Radio, Copy, Mic, MicOff, Volume2, VolumeX, Square, Download,
  RotateCcw, Headphones, Play, Sliders
} from 'lucide-react';
import { aiAPI } from '../services/api';
import type { AIStatusResponse } from '../types';
import { FormattedMarkdown } from './FormattedMarkdown';
import { ThinkingAnimation } from './ThinkingAnimation';
import {
  cleanTextForSpeech,
  getBestVoice,
  isSpeechRecognitionSupported,
  isSpeechSynthesisSupported,
} from '../utils/speechUtils';
import { generateDynamicSuggestions } from '../utils/suggestionGenerator';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  suggestions?: string[];
  model?: string;
  isStreaming?: boolean;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  role?: string;
}

const STORAGE_KEY_CUSTOM_AI = 'samarthya_custom_ai_config';
const STORAGE_KEY_AUTO_READ = 'samarthya_ai_auto_read';
const STORAGE_KEY_SPEECH_RATE = 'samarthya_ai_speech_rate';
const STORAGE_KEY_VOICE_LANG = 'samarthya_ai_voice_lang';

const QUICK_STARTER_PROMPTS = [
  { icon: '📚', label: 'Data Literacy Courses', text: 'Recommend foundational numeracy and data literacy courses on SAMARTHYA' },
  { icon: '🎯', label: 'Statistical Aptitude Quiz', text: 'Generate a 5-question multiple choice competency quiz on National Statistical Accounts and GDP' },
  { icon: '🏛️', label: 'MoSPI SDG Framework', text: 'Explain the MoSPI National Indicator Framework and how it tracks India’s Sustainable Development Goals' },
  { icon: '⚡', label: 'Bridge AI Competency Gap', text: 'How can an administrative officer bridge a 35% competency gap in Artificial Intelligence and Machine Learning?' },
];

export const AIAssistantModal: React.FC<Props> = ({
  isOpen,
  onClose,
  userName = 'Official',
  role = 'Statistical Officer',
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: `Namaste ${userName}! I am **Samarthya AI**, your real-time capacity building advisor for the Government of India (MoSPI).\n\nYou can ask me questions using text or **Voice Input (Microphone)**, and listen to any response using **Text-to-Speech**.\n\nHow can I assist your competency development or answer statistical and governance queries today?`,
      timestamp: 'Just now',
      suggestions: [
        'Foundational Numeracy & Data Literacy courses',
        'Quantitative Analysis for Public Administration',
        'Bridge my AI & ML gap (35% gap)',
        'Explain MoSPI National Indicator Framework',
      ],
    },
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [aiStatus, setAiStatus] = useState<AIStatusResponse | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [streamMode, setStreamMode] = useState(true);

  // ─── Voice Assistant & Audio State ─────────────────────────────
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState<string | null>(null);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const [autoRead, setAutoRead] = useState<boolean>(() => {
    return localStorage.getItem(STORAGE_KEY_AUTO_READ) === 'true';
  });

  const [speechRate, setSpeechRate] = useState<number>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_SPEECH_RATE);
    return saved ? parseFloat(saved) : 1.0;
  });

  const [voiceLang, setVoiceLang] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_VOICE_LANG);
    // Guarantee Hindi (hi-IN) as default
    if (!saved || saved === 'en-IN') {
      try {
        localStorage.setItem(STORAGE_KEY_VOICE_LANG, 'hi-IN');
      } catch { }
      return 'hi-IN';
    }
    return saved;
  });

  const stopStreamingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Custom Endpoint state (persisted in localStorage)
  const [customConfig, setCustomConfig] = useState<{
    api_key: string;
    base_url: string;
    model_id: string;
    useCustom: boolean;
  }>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_CUSTOM_AI);
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return {
      api_key: '',
      base_url: '',
      model_id: '',
      useCustom: false,
    };
  });

  const [isCustomModelExpanded, setIsCustomModelExpanded] = useState<boolean>(() => {
    return customConfig.useCustom;
  });

  const [testResult, setTestResult] = useState<{
    testing: boolean;
    success?: boolean;
    message?: string;
  }>({ testing: false });

  // ─── Status and Auto-Scroll ────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      aiAPI
        .status()
        .then((s) => setAiStatus(s))
        .catch(() => { });
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Clean up audio & recognition when closing
  useEffect(() => {
    if (!isOpen) {
      if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
      }
      setSpeakingMsgId(null);
      if (recognitionRef.current && isListening) {
        try {
          recognitionRef.current.stop();
        } catch { }
        setIsListening(false);
      }
    }
  }, [isOpen, isListening]);

  // ─── ESC Key to Close & Background Scroll Lock ─────────────────
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Esc') {
        e.preventDefault();
        if (showSettings) {
          setShowSettings(false);
        } else {
          onClose();
        }
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, showSettings, onClose]);

  const saveCustomConfig = (cfg: typeof customConfig) => {
    setCustomConfig(cfg);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_AI, JSON.stringify(cfg));
    } catch { }
  };

  const saveAutoRead = (enabled: boolean) => {
    setAutoRead(enabled);
    localStorage.setItem(STORAGE_KEY_AUTO_READ, enabled ? 'true' : 'false');
  };

  const saveSpeechRate = (rate: number) => {
    setSpeechRate(rate);
    localStorage.setItem(STORAGE_KEY_SPEECH_RATE, rate.toString());
  };

  const saveVoiceLang = (lang: string) => {
    setVoiceLang(lang);
    localStorage.setItem(STORAGE_KEY_VOICE_LANG, lang);
  };

  // ─── Text-to-Speech (TTS) Handler ──────────────────────────────
  const handleSpeak = (text: string, msgId: string) => {
    if (!isSpeechSynthesisSupported()) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }

    // If currently listening on microphone, stop it before speaking
    if (isListening && recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch { }
      setIsListening(false);
    }

    // Toggle off if currently reading this specific message
    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleaned = cleanTextForSpeech(text);
    if (!cleaned) return;

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const voice = getBestVoice(voiceLang);
    if (voice) {
      utterance.voice = voice;
    }
    utterance.rate = speechRate;
    utterance.pitch = 1.0;
    utterance.lang = voiceLang;

    utterance.onstart = () => {
      setSpeakingMsgId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = (e) => {
      console.warn('SpeechSynthesis error:', e);
      setSpeakingMsgId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    if (isSpeechSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
    setSpeakingMsgId(null);
  };

  const handleTestVoice = () => {
    handleSpeak(
      voiceLang === 'hi-IN'
        ? `नमस्ते ${userName}! सामर्थ्य एआई आवाज़ सहायक सक्रिय है और आपकी सहायता के लिए तैयार है।`
        : `Namaste ${userName}! Samarthya AI text to speech is active and ready to assist you.`,
      'test-voice'
    );
  };

  // ─── Speech-to-Text (Voice Input) Handler ──────────────────────
  const toggleListening = () => {
    // 1. If currently listening, stop the microphone
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch { }
      }
      setIsListening(false);
      return;
    }

    // 2. STOP TTS READING ALOUD IMMEDIATELY:
    // If AI is speaking/reading, stop audio so mic can hear user cleanly without feedback
    if (isSpeechSynthesisSupported()) {
      try {
        window.speechSynthesis.cancel();
      } catch { }
    }
    setSpeakingMsgId(null);

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechError(
        'Speech recognition is not supported in your browser. Please use Chrome, Edge, or Safari.'
      );
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = voiceLang;
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError(null);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setInputValue(currentTranscript);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow microphone access.');
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Voice input error: ${event.error}`);
        }
        setTimeout(() => setSpeechError(null), 5000);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.error('Failed to start speech recognition', err);
      setIsListening(false);
      setSpeechError('Failed to access microphone. Please check permissions.');
      setTimeout(() => setSpeechError(null), 5000);
    }
  };

  // ─── Chat Actions: Clear & Export ──────────────────────────────
  const handleClearChat = () => {
    if (window.confirm('Are you sure you want to clear this conversation?')) {
      handleStopSpeaking();
      setMessages([
        {
          id: Date.now().toString(),
          sender: 'ai',
          text: `Namaste ${userName}! Conversation reset. How can I assist your competency development or answer statistical queries today?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: [
            'Foundational Numeracy & Data Literacy courses',
            'Quantitative Analysis for Public Administration',
            'Bridge my AI & ML gap (35% gap)',
            'Explain MoSPI National Indicator Framework',
          ],
        },
      ]);
    }
  };

  const handleDownloadChat = () => {
    const activeModelName =
      (customConfig.useCustom && customConfig.model_id) ||
      aiStatus?.model_id ||
      'Local Engine';

    const dateStr = new Date().toLocaleString();
    const divider = '='.repeat(64);
    const subDivider = '-'.repeat(64);

    const header = [
      divider,
      'SAMARTHYA AI - CONSULTATION TRANSCRIPT',
      divider,
      `Date & Time : ${dateStr}`,
      `Official    : ${userName} (${role})`,
      `AI Engine   : ${activeModelName}`,
      divider,
      '',
    ].join('\n');

    const chatBody = messages
      .map((m) => {
        const senderLabel =
          m.sender === 'user'
            ? `[USER: ${userName}]`
            : `[AI: Samarthya AI (${m.model || activeModelName})]`;

        // Clean markdown formatting for clean plain-text reading
        const cleanMessage = m.text
          .replace(/\*\*(.*?)\*\*/g, '$1')
          .replace(/\*(.*?)\*/g, '$1')
          .replace(/^###?\s+/gm, '')
          .replace(/^---\s*$/gm, subDivider);

        return `${senderLabel} - ${m.timestamp}\n${subDivider}\n${cleanMessage}\n`;
      })
      .join('\n\n');

    const fullContent = `${header}\n${chatBody}\n\n${divider}\nEnd of Samarthya AI Transcript\n${divider}\n`;

    const blob = new Blob([fullContent], { type: 'text/plain;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `samarthya-ai-session-${new Date().toISOString().slice(0, 10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleStopGeneration = () => {
    stopStreamingRef.current = true;
    setIsTyping(false);
  };

  // ─── Test Connection Handler ───────────────────────────────────
  const handleTestConnection = async () => {
    setTestResult({ testing: true });
    try {
      const payload = customConfig.useCustom
        ? {
          api_key: customConfig.api_key || undefined,
          base_url: customConfig.base_url || undefined,
          model_id: customConfig.model_id || undefined,
        }
        : undefined;

      const res = await aiAPI.test(payload);
      if (res.success) {
        setTestResult({
          testing: false,
          success: true,
          message: `Connected! Model responded: "${res.response || 'OK'}"`,
        });
      } else {
        setTestResult({
          testing: false,
          success: false,
          message: res.error || res.message || 'Connection failed.',
        });
      }
    } catch (e: any) {
      setTestResult({
        testing: false,
        success: false,
        message: e.message || 'Network error.',
      });
    }
  };

  if (!isOpen) return null;

  // ─── Message Sender ────────────────────────────────────────────
  const handleSend = async (userText: string) => {
    if (!userText.trim() || isTyping) return;

    // Stop active speech playback if any
    handleStopSpeaking();
    stopStreamingRef.current = false;

    const userMsgId = Date.now().toString();
    const newMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    const historyPayload = messages.slice(-6).map((m) => ({
      sender: m.sender,
      text: m.text,
    }));

    const activeConfig = customConfig.useCustom
      ? {
        api_key: customConfig.api_key || undefined,
        base_url: customConfig.base_url || undefined,
        model_id: customConfig.model_id || undefined,
      }
      : undefined;

    const activeModelName =
      (customConfig.useCustom && customConfig.model_id) ||
      aiStatus?.model_id ||
      'gpt-4o-mini';

    const aiMsgId = (Date.now() + 1).toString();

    if (streamMode) {
      // ─── Realtime Streaming Mode ────────────────────────────────
      setMessages((prev) => [
        ...prev,
        {
          id: aiMsgId,
          sender: 'ai',
          text: '',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          model: activeModelName,
          isStreaming: true,
        },
      ]);

      try {
        let accumulated = '';
        for await (const chunk of aiAPI.streamChat(userText, historyPayload, activeConfig)) {
          if (stopStreamingRef.current) {
            break;
          }
          accumulated += chunk;
          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === aiMsgId ? { ...msg, text: accumulated } : msg
            )
          );
        }

        // Finalize streaming with dynamic, contextual suggestions
        const dynamicSuggestions = generateDynamicSuggestions(userText, accumulated);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                ...msg,
                isStreaming: false,
                suggestions: dynamicSuggestions,
              }
              : msg
          )
        );

        // Auto-read response if Voice Assistant mode is enabled
        if (autoRead && accumulated.trim()) {
          setTimeout(() => handleSpeak(accumulated, aiMsgId), 300);
        }
      } catch (err: any) {
        const isDataOrCourse = /data|quant|numera|stat|course|igot|recommend/i.test(userText);
        const fallbackText = isDataOrCourse
          ? `Assuming you are looking to build competencies around **foundational numeracy, quantitative analysis, and data literacy for public administration**, here are recommended courses available on the **SAMARTHYA** portal:\n\n---\n\n### 1. Foundational Data & Quantitative Literacy\n* **Data-Driven Decision Making for Public Policy**\n* **Competency:** Evidence-based Governance, Analytical Thinking\n* **Overview:** Covers how basic numerical data, trends, and administrative statistics can be collected, analyzed, and leveraged for sound policy decisions.\n* **Basic Statistics and Data Analysis for Public Servants**\n* **Competency:** Quantitative Aptitude, Statistical Acumen\n* **Overview:** Refreshes foundational mathematical and statistical concepts (averages, distributions, sampling basics, and percentage changes) used daily in administrative reporting.\n\n---\n\n### 2. Statistical Governance & Official Indicator Systems\n* **MoSPI National Indicator Framework & SDG Monitoring**\n* **Competency:** National Statistical System, Data Validation\n* **Overview:** Comprehensive walkthrough of India's National Indicator Framework tracking 300+ SDG indicators through administrative registries.`
          : `Assuming you are looking to build competencies around **${userText.slice(0, 50)}**, here are recommended courses available on the **SAMARTHYA** portal:\n\n---\n\n### 1. Priority SAMARTHYA Catalog\n* **Data-Driven Decision Making for Public Policy**\n* **Competency:** Evidence-based Governance, Analytical Thinking\n* **Overview:** Practical orientation on leveraging official data registers and administrative statistics.\n* **Statistical Governance & Ethics in Public Administration**\n* **Competency:** Administrative Ethics, Citizen Centricity\n* **Overview:** Frameworks for maintaining transparency and accountability in governance delivery.`;

        const fallbackSuggestions = generateDynamicSuggestions(userText, fallbackText);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === aiMsgId
              ? {
                ...msg,
                text: fallbackText,
                isStreaming: false,
                suggestions: fallbackSuggestions,
              }
              : msg
          )
        );

        if (autoRead && fallbackText.trim()) {
          setTimeout(() => handleSpeak(fallbackText, aiMsgId), 300);
        }
      } finally {
        setIsTyping(false);
      }
    } else {
      // ─── Non-Streaming Standard Mode ────────────────────────────
      try {
        const res = await aiAPI.chat(userText, historyPayload, undefined, activeConfig);
        const nonStreamSuggestions =
          res.suggestions && res.suggestions.length > 0
            ? res.suggestions
            : generateDynamicSuggestions(userText, res.reply);

        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: res.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: nonStreamSuggestions,
            model: res.model,
          },
        ]);

        if (autoRead && res.reply.trim()) {
          setTimeout(() => handleSpeak(res.reply, aiMsgId), 300);
        }
      } catch {
        const isDataOrCourse = /data|quant|numera|stat|course|igot|recommend/i.test(userText);
        const fallbackText = isDataOrCourse
          ? `Assuming you are looking to build competencies around **foundational numeracy, quantitative analysis, and data literacy for public administration**, here are recommended courses available on the **SAMARTHYA** portal:\n\n---\n\n### 1. Foundational Data & Quantitative Literacy\n* **Data-Driven Decision Making for Public Policy**\n* **Competency:** Evidence-based Governance, Analytical Thinking\n* **Overview:** Covers how basic numerical data, trends, and administrative statistics can be collected, analyzed, and leveraged for sound policy decisions.\n* **Basic Statistics and Data Analysis for Public Servants**\n* **Competency:** Quantitative Aptitude, Statistical Acumen\n* **Overview:** Refreshes foundational mathematical and statistical concepts (averages, distributions, sampling basics, and percentage changes) used daily in administrative reporting.\n\n---\n\n### 2. Statistical Governance & Official Indicator Systems\n* **MoSPI National Indicator Framework & SDG Monitoring**\n* **Competency:** National Statistical System, Data Validation\n* **Overview:** Comprehensive walkthrough of India's National Indicator Framework tracking 300+ SDG indicators through administrative registries.`
          : `Assuming you are looking to build competencies around **${userText.slice(0, 50)}**, here are recommended courses available on the **SAMARTHYA** portal:\n\n---\n\n### 1. Priority SAMARTHYA Catalog\n* **Data-Driven Decision Making for Public Policy**\n* **Competency:** Evidence-based Governance, Analytical Thinking\n* **Overview:** Practical orientation on leveraging official data registers and administrative statistics.\n* **Statistical Governance & Ethics in Public Administration**\n* **Competency:** Administrative Ethics, Citizen Centricity\n* **Overview:** Frameworks for maintaining transparency and accountability in governance delivery.`;

        const fallbackSuggestions = generateDynamicSuggestions(userText, fallbackText);
        setMessages((prev) => [
          ...prev,
          {
            id: aiMsgId,
            sender: 'ai',
            text: fallbackText,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            suggestions: fallbackSuggestions,
          },
        ]);

        if (autoRead && fallbackText.trim()) {
          setTimeout(() => handleSpeak(fallbackText, aiMsgId), 300);
        }
      } finally {
        setIsTyping(false);
      }
    }
  };

  const activeModelDisplay = customConfig.useCustom
    ? customConfig.model_id || 'Custom Model'
    : aiStatus?.configured
      ? aiStatus.model_id
      : 'Local Engine';

  if (!isOpen) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/50 backdrop-blur-xs animate-fadeIn cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-label="Samarthya AI Assistant"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="cursor-default relative w-full max-w-lg sm:max-w-2xl h-[82dvh] sm:h-[680px] sm:max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800/90 flex flex-col overflow-hidden"
      >
        {/* ─── Header ──────────────────────────────────────────────── */}
        <div className="p-3 sm:p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex-shrink-0">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-amber-300 shadow-inner flex-shrink-0">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h3 className="font-extrabold text-sm sm:text-base tracking-wide truncate">Samarthya AI</h3>
                <span className="hidden sm:inline-flex text-[10px] font-mono font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-2 py-0.5 rounded-full items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span className="truncate max-w-[120px]">{activeModelDisplay}</span>
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-300 truncate max-w-[130px] sm:max-w-[260px] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 sm:hidden flex-shrink-0" />
                <span className="truncate">MoSPI • {activeModelDisplay}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Live Audio Speaking Indicator Pill */}
            {speakingMsgId && (
              <button
                onClick={handleStopSpeaking}
                className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded-lg sm:rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-semibold hover:bg-emerald-500/30 transition-colors animate-pulse"
                title="Stop Text-to-Speech Audio"
              >
                <div className="flex items-center gap-0.5 h-3">
                  <span className="w-0.5 h-2 bg-emerald-400 animate-wave-1 rounded-full" />
                  <span className="w-0.5 h-3 bg-emerald-300 animate-wave-2 rounded-full" />
                  <span className="w-0.5 h-1.5 bg-emerald-400 animate-wave-3 rounded-full" />
                </div>
                <span className="text-[10px] sm:text-xs">Stop</span>
                <VolumeX className="w-3 h-3 ml-0.5" />
              </button>
            )}

            {/* Voice Assistant Hands-Free Mode Toggle */}
            <button
              onClick={() => saveAutoRead(!autoRead)}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${autoRead
                ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/30'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              title={
                autoRead
                  ? 'Voice Assistant Mode Active (Responses are read aloud automatically)'
                  : 'Turn on Voice Assistant Mode (Auto-read responses)'
              }
            >
              <Headphones className="w-4 h-4" />
              <span className="hidden md:inline text-[11px]">
                {autoRead ? 'Voice ON' : 'Voice Mode'}
              </span>
            </button>

            {/* Download Chat History (Visible on sm+, accessible in Settings on mobile) */}
            <button
              onClick={handleDownloadChat}
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Download Conversation (.txt)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Clear Conversation (Visible on sm+, accessible in Settings on mobile) */}
            <button
              onClick={handleClearChat}
              className="hidden sm:inline-flex p-2 rounded-xl text-slate-300 hover:text-rose-300 hover:bg-white/10 transition-colors"
              title="Clear Conversation"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Custom Endpoint & Audio Settings Toggle */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors ${showSettings || customConfig.useCustom
                ? 'bg-indigo-600 text-white'
                : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              title="Assistant Settings (Custom Endpoint & Voice Controls)"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg sm:rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors ml-0.5 flex items-center gap-1.5 group"
              title="Close Assistant (Esc)"
              aria-label="Close Assistant"
            >
              <span className="hidden sm:inline-block text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-white/10 text-slate-300 border border-white/10 group-hover:border-white/20">
                ESC
              </span>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ─── Expandable Settings & Voice Configuration Tray ─────── */}
        {showSettings && (
          <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700 text-xs space-y-3 sm:space-y-4 max-h-[55vh] overflow-y-auto animate-slideDown flex-shrink-0">
            {/* Mobile Quick Action Buttons Strip */}
            <div className="flex sm:hidden items-center gap-2 pb-2 border-b border-slate-200 dark:border-slate-700/70">
              <button
                type="button"
                onClick={handleDownloadChat}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Export Chat</span>
              </button>
              <button
                type="button"
                onClick={handleClearChat}
                className="flex-1 py-1.5 px-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-rose-600 dark:text-rose-400 text-[11px] font-semibold flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Chat</span>
              </button>
            </div>

            {/* 1. Voice Assistant & TTS Settings */}
            <div className="bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Headphones className="w-4 h-4 text-purple-500" />
                  <span className="font-bold text-slate-900 dark:text-white text-xs">
                    Voice Assistant & Speech Controls
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleTestVoice}
                  className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 dark:bg-purple-950/60 dark:hover:bg-purple-900/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 rounded-lg text-[11px] font-semibold flex items-center gap-1"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Test Voice</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Voice Assistant Auto-Read */}
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 block text-[11px]">
                      Auto-Read Responses
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Speaks replies automatically
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={autoRead}
                    onChange={(e) => saveAutoRead(e.target.checked)}
                    className="rounded text-purple-600 focus:ring-purple-500 h-4 w-4"
                  />
                </div>

                {/* Speech Rate Pills */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Speech Rate
                  </label>
                  <div className="flex gap-1">
                    {[0.85, 1.0, 1.25, 1.5].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => saveSpeechRate(rate)}
                        className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors border ${speechRate === rate
                          ? 'bg-purple-600 text-white border-purple-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50'
                          }`}
                      >
                        {rate}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Voice Accent / Language */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Voice Accent
                    </label>
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950/80 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                      Default: hi-IN
                    </span>
                  </div>
                  <select
                    value={voiceLang}
                    onChange={(e) => saveVoiceLang(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-[11px] focus:outline-none focus:ring-1 focus:ring-purple-500 font-semibold"
                  >
                    <option value="hi-IN">🇮🇳 Hindi (hi-IN) • Default</option>
                    <option value="en-IN">🇮🇳 Indian English (en-IN)</option>
                    <option value="en-US">🇺🇸 US English (en-US)</option>
                    <option value="en-GB">🇬🇧 UK English (en-GB)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 2. Custom OpenAI Configuration (Collapsible) */}
            <div className="bg-white dark:bg-slate-900/80 rounded-xl border border-slate-200 dark:border-slate-700/80 overflow-hidden shadow-2xs transition-all">
              {/* Clickable Header Bar */}
              <div
                onClick={() => setIsCustomModelExpanded((prev) => !prev)}
                className="p-3 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors select-none"
                role="button"
                tabIndex={0}
                title={isCustomModelExpanded ? 'Click to collapse configuration' : 'Click to expand configuration'}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsCustomModelExpanded((prev) => !prev);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/50 flex items-center justify-center flex-shrink-0">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      Custom OpenAI & Model Configuration
                    </span>
                    {customConfig.useCustom ? (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Active: {customConfig.model_id || 'Custom'}
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-400 hidden sm:inline">
                        (Click to expand)
                      </span>
                    )}
                  </div>
                  <span className="text-slate-400 ml-0.5 transition-transform duration-200">
                    {isCustomModelExpanded ? (
                      <ChevronUp className="w-4 h-4 text-indigo-500" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                </div>

                {/* Enable Checkbox */}
                <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 flex-shrink-0">
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-slate-200 text-xs">
                    <input
                      type="checkbox"
                      checked={customConfig.useCustom}
                      onChange={(e) => {
                        const isEnabled = e.target.checked;
                        saveCustomConfig({ ...customConfig, useCustom: isEnabled });
                        if (isEnabled) {
                          setIsCustomModelExpanded(true);
                        }
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                    />
                    <span className="hidden sm:inline">Enable Custom Endpoint</span>
                    <span className="sm:hidden">Enable</span>
                  </label>
                </div>
              </div>

              {/* Expandable/Collapsible Form Body */}
              {isCustomModelExpanded && (
                <div className="p-3 pt-0 border-t border-slate-200/80 dark:border-slate-800/80 space-y-3 animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Base URL Endpoint
                      </label>
                      <input
                        type="text"
                        value={customConfig.base_url}
                        onChange={(e) => saveCustomConfig({ ...customConfig, base_url: e.target.value })}
                        placeholder="https://your-custom-endpoint.com/v1"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Model ID / Name
                      </label>
                      <input
                        type="text"
                        value={customConfig.model_id}
                        onChange={(e) => saveCustomConfig({ ...customConfig, model_id: e.target.value })}
                        placeholder="ag/gemini-3.8-flash"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Custom API Key
                      </label>
                      <input
                        type="password"
                        value={customConfig.api_key}
                        onChange={(e) => saveCustomConfig({ ...customConfig, api_key: e.target.value })}
                        placeholder="YOUR_CUSTOM_API_KEY"
                        className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Test Connection Button & Result */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200 dark:border-slate-700/60">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleTestConnection}
                        disabled={testResult.testing}
                        className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center gap-1.5 shadow-sm transition-colors disabled:opacity-60"
                      >
                        {testResult.testing ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        <span>Test Connection</span>
                      </button>

                      <label className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 ml-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={streamMode}
                          onChange={(e) => setStreamMode(e.target.checked)}
                          className="rounded text-indigo-600"
                        />
                        <span>Realtime Token Streaming</span>
                      </label>
                    </div>

                    {testResult.message && (
                      <span
                        className={`text-[11px] font-semibold flex items-center gap-1 ${testResult.success
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-rose-600 dark:text-rose-400'
                          }`}
                      >
                        {testResult.success ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5" />
                        )}
                        <span>{testResult.message}</span>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ─── Message Stream Area ─────────────────────────────────── */}
        <div className="flex-1 p-3.5 sm:p-4 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-slate-950/40">
          {messages.map((m) => (
            <div key={m.id} className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              {m.sender === 'ai' && (
                <div className="relative flex-shrink-0 self-start mt-0.5">
                  {m.isStreaming && (!m.text || !m.text.trim()) && (
                    <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-xs animate-pulse" />
                  )}
                  <div
                    className={`relative w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs transition-all ${m.isStreaming && (!m.text || !m.text.trim())
                      ? 'bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 ring-2 ring-indigo-400/80 shadow-lg shadow-indigo-500/30'
                      : 'bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md'
                      }`}
                  >
                    <Sparkles
                      className={`w-4 h-4 ${m.isStreaming && (!m.text || !m.text.trim())
                        ? 'animate-spin text-amber-300'
                        : ''
                        }`}
                    />
                  </div>
                </div>
              )}

              <div className="max-w-[85%] space-y-2">
                <div
                  className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed shadow-sm transition-all duration-300 ${m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none whitespace-pre-line'
                    : m.isStreaming && (!m.text || !m.text.trim())
                      ? 'bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-indigo-300/80 dark:border-indigo-800/80 rounded-tl-none shadow-lg shadow-indigo-500/10 backdrop-blur-md min-w-[260px] sm:min-w-[360px] w-full sm:w-auto'
                      : 'bg-white dark:bg-slate-800/95 text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/60 rounded-tl-none'
                    }`}
                >
                  {m.sender === 'ai' ? (
                    <FormattedMarkdown content={m.text} isStreaming={m.isStreaming} model={m.model} />
                  ) : (
                    m.text
                  )}
                </div>

                {/* Suggestion Pills */}
                {m.suggestions && m.suggestions.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {m.suggestions.map((sug, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(sug)}
                        className="text-xs bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-slate-700 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors shadow-2xs text-left"
                      >
                        ⚡ {sug}
                      </button>
                    ))}
                  </div>
                )}

                {/* Message Action Footer: Timestamp, Model, TTS Play/Stop, and Copy */}
                <div className="flex items-center justify-between text-[10px] text-slate-400 px-1 select-none flex-wrap gap-2">
                  <p>
                    {m.timestamp}
                    {m.model && ` • ${m.model}`}
                  </p>

                  {m.sender === 'ai' && m.text && (
                    <div className="flex items-center gap-2">
                      {/* Text-to-Speech Play/Stop Button */}
                      {speakingMsgId === m.id ? (
                        <button
                          onClick={() => handleSpeak(m.text, m.id)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 font-semibold text-[11px] border border-indigo-300/60 dark:border-indigo-800/60 shadow-2xs hover:bg-indigo-200 dark:hover:bg-indigo-900 transition-colors"
                          title="Stop reading aloud"
                        >
                          <div className="flex items-center gap-0.5 h-3">
                            <span className="w-0.5 h-2 bg-indigo-600 dark:bg-indigo-400 animate-wave-1 rounded-full" />
                            <span className="w-0.5 h-3 bg-purple-600 dark:bg-purple-400 animate-wave-2 rounded-full" />
                            <span className="w-0.5 h-1.5 bg-pink-600 dark:bg-pink-400 animate-wave-3 rounded-full" />
                          </div>
                          <VolumeX className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                          <span>Stop Audio</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSpeak(m.text, m.id)}
                          className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors px-1 py-0.5 rounded cursor-pointer"
                          title="Listen to response (Text-to-Speech)"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen</span>
                        </button>
                      )}

                      {/* Copy Response Button */}
                      <button
                        onClick={async () => {
                          let ok = false;
                          if (navigator?.clipboard?.writeText) {
                            try {
                              await navigator.clipboard.writeText(m.text);
                              ok = true;
                            } catch { }
                          }
                          if (!ok) {
                            try {
                              const ta = document.createElement('textarea');
                              ta.value = m.text;
                              ta.style.position = 'fixed';
                              ta.style.opacity = '0';
                              document.body.appendChild(ta);
                              ta.select();
                              document.execCommand('copy');
                              document.body.removeChild(ta);
                            } catch { }
                          }
                        }}
                        className="hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 transition-colors px-1 py-0.5 rounded cursor-pointer"
                        title="Copy full message text"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* ─── Thinking Animation (Active Reasoning Progress) ─── */}
          {isTyping && !messages.some((m) => m.isStreaming) && (
            <div className="flex gap-3 justify-start animate-fadeIn">
              <div className="relative flex-shrink-0 self-start mt-0.5">
                <span className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 opacity-60 blur-xs animate-pulse" />
                <div className="relative w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 ring-2 ring-indigo-400/80 shadow-lg shadow-indigo-500/30 flex items-center justify-center text-white text-xs">
                  <Sparkles className="w-4 h-4 animate-spin text-amber-300" />
                </div>
              </div>
              <div className="p-4 rounded-2xl bg-white/95 dark:bg-slate-900/90 text-slate-800 dark:text-slate-100 border border-indigo-300/80 dark:border-indigo-800/80 rounded-tl-none shadow-lg shadow-indigo-500/10 backdrop-blur-md min-w-[260px] sm:min-w-[360px] max-w-[85%]">
                <ThinkingAnimation model={activeModelDisplay} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ─── Quick Starter Prompts Chips Bar (Shown when 1 message) ── */}
        {messages.length === 1 && (
          <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-200/60 dark:border-slate-800 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex-shrink-0">
              Quick Ask:
            </span>
            {QUICK_STARTER_PROMPTS.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p.text)}
                className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs transition-colors flex items-center gap-1.5 flex-shrink-0"
              >
                <span>{p.icon}</span>
                <span>{p.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* ─── Listening Waveform Banner (Active when Mic is recording) ── */}
        {isListening && (
          <div className="px-4 py-2 bg-gradient-to-r from-rose-500/10 via-purple-500/10 to-indigo-500/10 border-t border-rose-200/80 dark:border-rose-900/60 flex items-center justify-between animate-fadeIn">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-600" />
              </span>
              <div className="flex items-center gap-1 h-3.5">
                <span className="w-1 bg-rose-500 rounded-full animate-wave-1" />
                <span className="w-1 bg-purple-500 rounded-full animate-wave-2" />
                <span className="w-1 bg-indigo-500 rounded-full animate-wave-3" />
                <span className="w-1 bg-rose-500 rounded-full animate-wave-4" />
              </div>
              <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">
                Listening to your voice... Speak now
              </span>
            </div>

            <button
              onClick={toggleListening}
              className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline px-2 py-0.5"
            >
              Done / Stop
            </button>
          </div>
        )}

        {/* ─── Speech Recognition Error Toast ──────────────────────── */}
        {speechError && (
          <div className="px-4 py-1.5 bg-rose-50 dark:bg-rose-950/60 border-t border-rose-200 dark:border-rose-800 text-[11px] text-rose-600 dark:text-rose-400 flex items-center justify-between">
            <span>⚠️ {speechError}</span>
            <button onClick={() => setSpeechError(null)} className="hover:opacity-75 font-bold ml-2">
              ✕
            </button>
          </div>
        )}

        {/* ─── Bottom Input Bar ────────────────────────────────────── */}
        <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          {/* Microphone Voice Input Button */}
          <button
            type="button"
            onClick={toggleListening}
            className={`p-2.5 rounded-xl transition-all flex-shrink-0 cursor-pointer ${isListening
              ? 'bg-rose-600 text-white ring-4 ring-rose-500/30 animate-pulse shadow-md shadow-rose-600/30 scale-105'
              : speakingMsgId
                ? 'bg-purple-100 hover:bg-rose-600 hover:text-white text-purple-700 dark:bg-purple-950/80 dark:text-purple-300 dark:hover:bg-rose-600 dark:hover:text-white border border-purple-300 dark:border-purple-700 animate-bounce'
                : 'bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700'
              }`}
            title={
              isListening
                ? 'Click to stop listening'
                : speakingMsgId
                  ? 'Stop reading & speak using microphone'
                  : 'Speak your question (Voice Input)'
            }
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              if (speakingMsgId) handleStopSpeaking();
              setInputValue(e.target.value);
            }}
            onKeyDown={(e) => e.key === 'Enter' && !isTyping && handleSend(inputValue)}
            placeholder={
              isListening
                ? 'Listening to your voice...'
                : speakingMsgId
                  ? 'Speaking response... Click mic to interrupt & ask'
                  : 'Ask Samarthya AI or speak your query...'
            }
            className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs md:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
          />

          {/* Send or Stop Generation Button */}
          {isTyping ? (
            <button
              onClick={handleStopGeneration}
              className="px-3 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors shadow-md shadow-rose-600/20 flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold"
              title="Stop Generating Response"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
              <span className="hidden sm:inline">Stop</span>
            </button>
          ) : (
            <button
              onClick={() => handleSend(inputValue)}
              disabled={!inputValue.trim()}
              className="p-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl transition-colors shadow-md shadow-indigo-600/20 flex-shrink-0"
              title="Send Message"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistantModal;
