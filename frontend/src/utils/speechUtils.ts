/**
 * Utilities for Samarthya Voice Assistant & Text-to-Speech
 */

export const isSpeechRecognitionSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition
  );
};

export const isSpeechSynthesisSupported = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean('speechSynthesis' in window && window.speechSynthesis);
};

/**
 * Cleans Markdown formatting, LaTeX code, and code blocks into natural,
 * pleasant-sounding spoken text suitable for Web Speech API TTS.
 */
export const cleanTextForSpeech = (markdown: string): string => {
  if (!markdown) return '';

  let text = markdown;

  // 1. Replace code blocks with brief spoken marker
  text = text.replace(/```[a-z]*\n[\s\S]*?```/gi, ' Code snippet provided. ');
  text = text.replace(/`([^`]+)`/g, '$1');

  // 2. Clean LaTeX math expressions
  text = text.replace(/\$\$([\s\S]*?)\$\$/g, (_match, formula) => {
    return cleanFormula(formula);
  });
  text = text.replace(/\$([^\$\n]+)\$/g, (_match, formula) => {
    return cleanFormula(formula);
  });

  // 3. Clean Markdown headers, bold, italics, strikethrough
  text = text.replace(/^#{1,6}\s+(.*)$/gm, '$1. ');
  text = text.replace(/\*\*([^*]+)\*\*/g, '$1');
  text = text.replace(/\*([^*]+)\*/g, '$1');
  text = text.replace(/__([^_]+)__/g, '$1');
  text = text.replace(/_([^_]+)_/g, '$1');
  text = text.replace(/~~([^~]+)~~/g, '$1');

  // 4. Clean Markdown links [label](url) -> label
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

  // 5. Clean dividers, bullets, numbering
  text = text.replace(/^---+$/gm, '');
  text = text.replace(/^[\*\-\+]\s+/gm, '');
  text = text.replace(/^\d+\.\s+/gm, '');

  // 6. Clean multiple spaces / newlines
  text = text.replace(/\n{2,}/g, '. ');
  text = text.replace(/\n/g, ' ');
  text = text.replace(/\s{2,}/g, ' ');

  return text.trim();
};

const cleanFormula = (formula: string): string => {
  return formula
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\times/g, ' multiplied by ')
    .replace(/\\div/g, ' divided by ')
    .replace(/\\pm/g, ' plus or minus ')
    .replace(/\+/g, ' plus ')
    .replace(/-/g, ' minus ')
    .replace(/=/g, ' equals ')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 over $2')
    .replace(/[{}\\_^]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Intelligent voice selection based on target language,
 * prioritizing Hindi (hi-IN) as default, followed by Indian English and natural neural voices.
 */
export const getBestVoice = (lang: string = 'hi-IN'): SpeechSynthesisVoice | null => {
  if (!isSpeechSynthesisSupported()) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLang = (lang || 'hi-IN').toLowerCase().replace('_', '-');

  // 1. If Hindi specifically requested (DEFAULT)
  if (targetLang.startsWith('hi')) {
    const hiVoices = voices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      return (
        vLang.startsWith('hi') ||
        vName.includes('hindi') ||
        vName.includes('kalpana') ||
        vName.includes('hemant') ||
        vName.includes('swara') ||
        vName.includes('madhur') ||
        vName.includes('lekha')
      );
    });

    if (hiVoices.length > 0) {
      const premium = hiVoices.find(
        (v) =>
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('kalpana') ||
          v.name.toLowerCase().includes('swara')
      );
      return premium || hiVoices[0];
    }
  }

  // 2. If Indian English specifically requested
  if (targetLang === 'en-in') {
    const enInVoices = voices.filter((v) => {
      const vLang = v.lang.toLowerCase().replace('_', '-');
      const vName = v.name.toLowerCase();
      const isEnglish = vLang.startsWith('en');
      const isIndian =
        vLang.includes('in') ||
        vName.includes('india') ||
        vName.includes('heera') ||
        vName.includes('ravi') ||
        vName.includes('neerja') ||
        vName.includes('prabhat');
      return isEnglish && isIndian;
    });

    if (enInVoices.length > 0) {
      const premium = enInVoices.find(
        (v) =>
          v.name.toLowerCase().includes('google') ||
          v.name.toLowerCase().includes('natural') ||
          v.name.toLowerCase().includes('neural') ||
          v.name.toLowerCase().includes('ravi') ||
          v.name.toLowerCase().includes('heera')
      );
      return premium || enInVoices[0];
    }
  }

  // 3. Exact language match (e.g. 'hi-in', 'en-us', 'en-gb')
  const exactVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    return vLang === targetLang;
  });
  if (exactVoices.length > 0) {
    return exactVoices[0];
  }

  // 4. Fall back to matching language family (e.g. 'hi' or 'en')
  const prefix = targetLang.split('-')[0];
  const familyVoices = voices.filter((v) => {
    const vLang = v.lang.toLowerCase().replace('_', '-');
    return vLang.startsWith(prefix);
  });
  if (familyVoices.length > 0) {
    const premium = familyVoices.find(
      (v) =>
        v.name.toLowerCase().includes('natural') ||
        v.name.toLowerCase().includes('google') ||
        v.name.toLowerCase().includes('siri')
    );
    return premium || familyVoices[0];
  }

  // 5. Fall back to system default
  return voices.find((v) => v.default) || voices[0];
};
