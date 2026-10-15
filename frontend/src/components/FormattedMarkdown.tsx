import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { ThinkingAnimation } from './ThinkingAnimation';

interface Props {
  content: string;
  className?: string;
  isStreaming?: boolean;
  model?: string;
}

const CodeBlock: React.FC<{ code: string; language: string }> = ({ code, language }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    let success = false;

    // 1. Modern navigator.clipboard API
    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(code);
        success = true;
      } catch {
        // fallback
      }
    }

    // 2. Synchronous reliable textarea fallback for all browser contexts
    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = code;
        textArea.style.position = 'fixed';
        textArea.style.top = '0';
        textArea.style.left = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayLang = (language || 'code').toUpperCase();

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-slate-800 bg-slate-950 text-slate-100 shadow-md">
      {/* Header bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-slate-900/90 border-b border-slate-800/80 text-xs select-none">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <span className="font-mono text-[10px] font-bold tracking-wider text-slate-400 ml-1">
            {displayLang}
          </span>
        </div>
        <button
          onClick={handleCopy}
          type="button"
          className={`flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-md transition-all cursor-pointer z-10 select-none ${
            copied
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs'
              : 'text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700/60'
          }`}
          title="Copy code to clipboard"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-300 text-[10px] font-bold">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-300" />
              <span className="text-[10px] font-medium">Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code body */}
      <pre className="p-3.5 font-mono text-xs leading-relaxed overflow-x-auto text-slate-200 selection:bg-indigo-600 selection:text-white">
        <code>{code}</code>
      </pre>
    </div>
  );
};

const renderMath = (latex: string): React.ReactNode[] => {
  // Replace common LaTeX symbols
  let clean = latex
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\leq/g, ' ≤ ')
    .replace(/\\geq/g, ' ≥ ')
    .replace(/\\le(?![a-zA-Z])/g, ' ≤ ')
    .replace(/\\ge(?![a-zA-Z])/g, ' ≥ ')
    .replace(/\\infty/g, ' ∞ ')
    .replace(/\\sum/g, ' ∑ ')
    .replace(/\\prod/g, ' ∏ ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\pi/g, 'π');

  // Handle \frac{a}{b} -> (a / b)
  clean = clean.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  // Handle \sqrt{a} -> √(a)
  clean = clean.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Split by \text{...} to style upright text vs math
  const parts: React.ReactNode[] = [];
  const textRegex = /\\text\{([^}]+)\}/g;
  let lastIdx = 0;
  let m: RegExpExecArray | null;

  while ((m = textRegex.exec(clean)) !== null) {
    if (m.index > lastIdx) {
      const mathSegment = clean.slice(lastIdx, m.index);
      parts.push(
        <span key={`m-${lastIdx}`} className="font-serif italic tracking-wide">
          {mathSegment.replace(/-/g, ' − ')}
        </span>
      );
    }
    parts.push(
      <span
        key={`t-${m.index}`}
        className="font-sans not-italic font-semibold text-slate-900 dark:text-white px-0.5"
      >
        {m[1]}
      </span>
    );
    lastIdx = textRegex.lastIndex;
  }

  if (lastIdx < clean.length) {
    const mathSegment = clean.slice(lastIdx);
    parts.push(
      <span key={`m-${lastIdx}`} className="font-serif italic tracking-wide">
        {mathSegment.replace(/-/g, ' − ')}
      </span>
    );
  }

  return parts;
};

export const FormattedMarkdown: React.FC<Props> = ({
  content,
  className = '',
  isStreaming = false,
  model,
}) => {
  if (!content || !content.trim()) {
    if (isStreaming) {
      return <ThinkingAnimation model={model} />;
    }
    return null;
  }

  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let inList = false;
  let listItems: React.ReactNode[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBlockLines: string[] = [];
  let hrCount = 0;

  const flushList = () => {
    if (inList && listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1 list-none pl-0">
          {listItems}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const renderInline = (text: string): React.ReactNode[] => {
    const tokens: React.ReactNode[] = [];
    // Matches $$math$$, $math$, ***bold italic***, **bold**, `code`, [link](url), *italic*
    const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*)/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.slice(lastIndex, match.index));
      }

      const matchText = match[0];

      if (matchText.startsWith('$') && matchText.endsWith('$')) {
        const isBlock = matchText.startsWith('$$') && matchText.endsWith('$$');
        const rawMath = isBlock ? matchText.slice(2, -2) : matchText.slice(1, -1);
        tokens.push(
          <span
            key={`math-${match.index}`}
            className="inline-flex items-center gap-1 font-serif text-xs md:text-sm px-2 py-0.5 my-0.5 rounded-md bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs mx-0.5 align-baseline"
          >
            {renderMath(rawMath)}
          </span>
        );
      } else if (matchText.startsWith('***') && matchText.endsWith('***')) {
        tokens.push(
          <strong
            key={`bi-${match.index}`}
            className="font-black italic text-slate-950 dark:text-white"
          >
            {matchText.slice(3, -3)}
          </strong>
        );
      } else if (matchText.startsWith('**') && matchText.endsWith('**')) {
        tokens.push(
          <strong
            key={`b-${match.index}`}
            className="font-extrabold text-slate-900 dark:text-white"
          >
            {matchText.slice(2, -2)}
          </strong>
        );
      } else if (matchText.startsWith('`') && matchText.endsWith('`')) {
        tokens.push(
          <code
            key={`c-${match.index}`}
            className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded border border-slate-200/80 dark:border-slate-700 font-semibold"
          >
            {matchText.slice(1, -1)}
          </code>
        );
      } else if (
        matchText.startsWith('[') &&
        matchText.includes('](') &&
        matchText.endsWith(')')
      ) {
        const closeBracket = matchText.indexOf('](');
        const linkText = matchText.slice(1, closeBracket);
        const linkUrl = matchText.slice(closeBracket + 2, -1);
        tokens.push(
          <a
            key={`l-${match.index}`}
            href={linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-indigo-600 dark:text-indigo-400 underline font-semibold hover:text-indigo-700 dark:hover:text-indigo-300"
          >
            {linkText}
          </a>
        );
      } else if (matchText.startsWith('*') && matchText.endsWith('*')) {
        tokens.push(
          <em
            key={`i-${match.index}`}
            className="italic text-slate-700 dark:text-slate-300"
          >
            {matchText.slice(1, -1)}
          </em>
        );
      }

      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      tokens.push(text.slice(lastIndex));
    }

    return tokens;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 0. Handle Fenced Code Blocks (```html, ```python, ```, etc.)
    if (!inCodeBlock && trimmed.startsWith('```')) {
      flushList();
      inCodeBlock = true;
      const match = trimmed.match(/^```([a-zA-Z0-9_\-\.\+]*)/);
      codeBlockLang = match ? match[1].toLowerCase() : '';
      codeBlockLines = [];
      return;
    }

    if (inCodeBlock) {
      if (trimmed === '```') {
        elements.push(
          <CodeBlock
            key={`code-${elements.length}-${index}`}
            language={codeBlockLang}
            code={codeBlockLines.join('\n')}
          />
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
        return;
      }
      // Preserve original line spacing and indentation
      codeBlockLines.push(line);
      return;
    }

    // 1. Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      if (hrCount === 0) {
        hrCount++;
        elements.push(
          <div key={`hr-${index}`} className="my-3.5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-slate-200 dark:to-slate-800" />
            <span className="text-[9px] font-black tracking-widest uppercase text-indigo-600/80 dark:text-indigo-400/90 px-1 select-none">
              iGOT Karmayogi
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 dark:via-slate-700 to-slate-200 dark:to-slate-800" />
          </div>
        );
      } else {
        hrCount++;
        elements.push(
          <div key={`hr-${index}`} className="my-3 border-t border-slate-200/80 dark:border-slate-800" />
        );
      }
      return;
    }

    // 2. Heading 4 (#### Phase 1: ... or #### Heading)
    if (trimmed.startsWith('#### ')) {
      flushList();
      const rawText = trimmed.slice(5).trim();

      // Check for Phase / Step / Week / Milestone pattern: e.g. "Phase 1: Foundational & Responsible AI (Closes ~10% Gap)"
      const phaseMatch = rawText.match(/^(Phase\s+\d+|Step\s+\d+|Stage\s+\d+|Week\s+\d+|Module\s+\d+|Part\s+\d+):\s*(.*)$/i);

      if (phaseMatch) {
        const phaseLabel = phaseMatch[1];
        const rest = phaseMatch[2].trim();

        // Check if there is an ending parenthetical badge like "(Closes ~10% Gap)" or "(12 hrs)"
        const badgeMatch = rest.match(/^(.*?)(?:\s*\(([^)]+)\))$/);
        const titleText = badgeMatch ? badgeMatch[1].trim() : rest;
        const badgeText = badgeMatch ? badgeMatch[2].trim() : null;

        elements.push(
          <div
            key={`h4-phase-${index}`}
            className="mt-3.5 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/90 via-violet-50/50 to-transparent dark:from-indigo-950/50 dark:via-violet-950/25 dark:to-transparent border border-indigo-200/80 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs flex-shrink-0">
                ⚡ {phaseLabel}
              </span>
              <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white leading-tight">
                {renderInline(titleText)}
              </span>
            </div>
            {badgeText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 shadow-2xs flex-shrink-0">
                🎯 {badgeText}
              </span>
            )}
          </div>
        );
      } else {
        // Standard H4
        elements.push(
          <div
            key={`h4-${index}`}
            className="mt-3 mb-1.5 flex items-center gap-2"
          >
            <span className="w-1.5 h-3.5 bg-indigo-500 dark:bg-indigo-400 rounded-sm flex-shrink-0" />
            <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {renderInline(rawText)}
            </h4>
          </div>
        );
      }
      return;
    }

    // 3. Heading 3 (### Heading or ### Phase 1: ...)
    if (trimmed.startsWith('### ')) {
      flushList();
      const text = trimmed.slice(4).trim();

      // Check if ### is used for a Phase milestone
      const phaseMatch = text.match(/^(Phase\s+\d+|Step\s+\d+|Stage\s+\d+|Week\s+\d+|Module\s+\d+|Part\s+\d+):\s*(.*)$/i);
      if (phaseMatch) {
        const phaseLabel = phaseMatch[1];
        const rest = phaseMatch[2].trim();
        const badgeMatch = rest.match(/^(.*?)(?:\s*\(([^)]+)\))$/);
        const titleText = badgeMatch ? badgeMatch[1].trim() : rest;
        const badgeText = badgeMatch ? badgeMatch[2].trim() : null;

        elements.push(
          <div
            key={`h3-phase-${index}`}
            className="mt-3.5 mb-2 p-2.5 rounded-xl bg-gradient-to-r from-indigo-50/90 via-violet-50/50 to-transparent dark:from-indigo-950/50 dark:via-violet-950/25 dark:to-transparent border border-indigo-200/80 dark:border-indigo-800/50 flex flex-wrap items-center justify-between gap-2 shadow-2xs"
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-xs flex-shrink-0">
                ⚡ {phaseLabel}
              </span>
              <span className="font-bold text-xs md:text-sm text-slate-900 dark:text-white leading-tight">
                {renderInline(titleText)}
              </span>
            </div>
            {badgeText && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/80 shadow-2xs flex-shrink-0">
                🎯 {badgeText}
              </span>
            )}
          </div>
        );
        return;
      }

      elements.push(
        <div
          key={`h3-${index}`}
          className="mt-4 mb-2 pb-1.5 border-b border-indigo-100 dark:border-indigo-950/80 flex items-center gap-2"
        >
          <span className="w-1.5 h-4.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full flex-shrink-0" />
          <h3 className="text-sm md:text-base font-bold text-indigo-950 dark:text-indigo-200 tracking-tight">
            {renderInline(text)}
          </h3>
        </div>
      );
      return;
    }

    // 4. Heading 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      flushList();
      const text = trimmed.slice(3);
      elements.push(
        <h2
          key={`h2-${index}`}
          className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>{renderInline(text)}</span>
        </h2>
      );
      return;
    }

    // 5. Heading 1 (# Heading)
    if (trimmed.startsWith('# ')) {
      flushList();
      const text = trimmed.slice(2);
      elements.push(
        <h1
          key={`h1-${index}`}
          className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-4 mb-2"
        >
          {renderInline(text)}
        </h1>
      );
      return;
    }

    // 6. Bullet list item (* Item, - Item, • Item)
    if (/^(\*|\-|\•)\s+/.test(trimmed)) {
      inList = true;
      const bulletContent = trimmed.replace(/^(\*|\-|\•)\s+/, '');

      // Check for specialized course recommendation structures
      const compMatch = bulletContent.match(/^\*\*(Competency|Competencies):?\*\*:?\s*(.*)$/i) ||
                        bulletContent.match(/^(Competency|Competencies):\s*(.*)$/i);

      const overviewMatch = bulletContent.match(/^\*\*(Overview|Description|Summary):?\*\*:?\s*(.*)$/i) ||
                            bulletContent.match(/^(Overview|Description|Summary):\s*(.*)$/i);

      const isCourseTitle = /^\*\*([^*]+)\*\*$/.test(bulletContent) && !compMatch && !overviewMatch;

      if (isCourseTitle) {
        // Course Title item
        const courseName = bulletContent.slice(2, -2);
        listItems.push(
          <li
            key={`li-${index}`}
            className="pt-2.5 pb-1 flex items-center gap-2 text-xs md:text-sm font-bold text-slate-900 dark:text-white border-t border-slate-100 dark:border-slate-800/80 first:border-t-0 first:pt-1"
          >
            <span className="w-5 h-5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs flex-shrink-0 shadow-2xs">
              📘
            </span>
            <span className="font-extrabold text-slate-900 dark:text-white tracking-tight">
              {courseName}
            </span>
          </li>
        );
      } else if (compMatch) {
        // Competency badge item
        const competencyText = compMatch[2];
        listItems.push(
          <li
            key={`li-${index}`}
            className="pl-7 py-0.5 flex flex-wrap items-center gap-2 text-xs text-slate-700 dark:text-slate-300"
          >
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/90 dark:border-amber-800/60 shadow-2xs flex-shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Competency:
            </span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {renderInline(competencyText)}
            </span>
          </li>
        );
      } else if (overviewMatch) {
        // Overview description item
        const overviewText = overviewMatch[2];
        listItems.push(
          <li
            key={`li-${index}`}
            className="pl-7 pb-2 pt-0.5 flex items-start gap-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed"
          >
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex-shrink-0 mt-0.5">
              Overview:
            </span>
            <span className="text-slate-700 dark:text-slate-300">
              {renderInline(overviewText)}
            </span>
          </li>
        );
      } else {
        // Standard bullet item
        listItems.push(
          <li
            key={`li-${index}`}
            className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed py-0.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">{renderInline(bulletContent)}</div>
          </li>
        );
      }
      return;
    }

    // 7. Multiple Choice Option item (A) ..., B) ..., C) ..., D) ... or A. ..., B. ...)
    const optionMatch = trimmed.match(/^([A-Da-d])[\)\.]\s+(.*)$/) || trimmed.match(/^\(([A-Da-d])\)\s+(.*)$/);
    if (optionMatch) {
      flushList();
      const letter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2].trim();

      elements.push(
        <div
          key={`option-${index}`}
          className="my-1.5 p-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 hover:bg-indigo-50/60 dark:hover:bg-indigo-950/40 hover:border-indigo-300 dark:hover:border-indigo-700/80 transition-all flex items-start gap-2.5 shadow-2xs group"
        >
          <span className="w-6 h-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 font-mono font-bold text-xs flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors border border-indigo-200 dark:border-indigo-800 shadow-2xs mt-0.5">
            {letter}
          </span>
          <div className="flex-1 min-w-0 text-xs md:text-sm text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
            {renderInline(optionText)}
          </div>
        </div>
      );
      return;
    }

    // 8. Standalone block math ($$...$$)
    if (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) {
      flushList();
      const mathContent = trimmed.slice(2, -2).trim();
      elements.push(
        <div
          key={`mathblock-${index}`}
          className="my-2.5 p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200/70 dark:border-indigo-800/50 flex items-center justify-center overflow-x-auto shadow-2xs text-xs md:text-sm text-indigo-950 dark:text-indigo-200"
        >
          {renderMath(mathContent)}
        </div>
      );
      return;
    }

    // 9. Numbered list item (1. Item, 2. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      const num = numMatch[1];
      const text = numMatch[2];
      elements.push(
        <div
          key={`num-${index}`}
          className="flex items-start gap-2.5 my-1.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0">
            {num}.
          </span>
          <div className="flex-1 min-w-0">{renderInline(text)}</div>
        </div>
      );
      return;
    }

    // 8. Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`empty-${index}`} className="h-1.5" />);
      return;
    }

    // 9. Normal paragraph
    flushList();
    elements.push(
      <p
        key={`p-${index}`}
        className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
      >
        {renderInline(trimmed)}
      </p>
    );
  });

  flushList();

  // If code block is still unclosed (e.g. streaming chunks)
  if (inCodeBlock && codeBlockLines.length > 0) {
    elements.push(
      <CodeBlock
        key={`code-unclosed-${elements.length}`}
        language={codeBlockLang}
        code={codeBlockLines.join('\n')}
      />
    );
  }

  return (
    <div className={`space-y-1 ${className}`}>
      {elements}
      {isStreaming && (
        <span className="inline-block w-2 h-4 ml-1.5 rounded-xs bg-gradient-to-b from-indigo-500 via-purple-500 to-violet-600 animate-pulse align-middle shadow-xs" />
      )}
    </div>
  );
};

export default FormattedMarkdown;
