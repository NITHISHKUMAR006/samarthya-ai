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

/**
 * Robust LaTeX math formula cleaner: strips LaTeX syntax wrappers, translates
 * math symbols, handles backslash spaces (\ ), \mathbf, fractions, and brackets.
 */
export const cleanLatexMath = (input: string): string => {
  let s = input.trim();

  // Strip outer delimiters ($$, $, \[, \], \(, \))
  if (s.startsWith('$$') && s.endsWith('$$') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  } else if (s.startsWith('\\[') && s.endsWith('\\]') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('\\(') && s.endsWith('\\)') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  }

  // Handle LaTeX spaces
  s = s.replace(/\\qquad/g, '    ');
  s = s.replace(/\\quad/g, '  ');
  s = s.replace(/\\\s/g, ' ');

  // Strip math formatting wrappers like \mathbf{...}, \textbf{...}, \text{...}
  for (let l = 0; l < 5; l++) {
    const prev = s;
    s = s.replace(/\\(mathbf|textbf|mathit|textit|mathrm|text|boldsymbol)\{([^{}]+)\}/g, '$2');
    if (s === prev) break;
  }

  // Common math symbols
  s = s
    .replace(/\\times/g, ' × ')
    .replace(/\\div/g, ' ÷ ')
    .replace(/\\pm/g, ' ± ')
    .replace(/\\mp/g, ' ∓ ')
    .replace(/\\cdot/g, ' · ')
    .replace(/\\bullet/g, ' • ')
    .replace(/\\approx/g, ' ≈ ')
    .replace(/\\neq/g, ' ≠ ')
    .replace(/\\leq/g, ' ≤ ')
    .replace(/\\geq/g, ' ≥ ')
    .replace(/\\le(?![a-zA-Z])/g, ' ≤ ')
    .replace(/\\ge(?![a-zA-Z])/g, ' ≥ ')
    .replace(/\\infty/g, ' ∞ ')
    .replace(/\\sum/g, ' ∑ ')
    .replace(/\\prod/g, ' ∏ ')
    .replace(/\\int/g, ' ∫ ')
    .replace(/\\partial/g, ' ∂ ')
    .replace(/\\to/g, ' → ')
    .replace(/\\rightarrow/g, ' → ')
    .replace(/\\leftarrow/g, ' ← ')
    .replace(/\\Rightarrow/g, ' ⇒ ')
    .replace(/\\Leftarrow/g, ' ⇐ ')
    .replace(/\\Leftrightarrow/g, ' ⇔ ')
    .replace(/\\in(?![a-zA-Z])/g, ' ∈ ')
    .replace(/\\notin/g, ' ∉ ')
    .replace(/\\alpha/g, 'α')
    .replace(/\\beta/g, 'β')
    .replace(/\\gamma/g, 'γ')
    .replace(/\\delta/g, 'δ')
    .replace(/\\Delta/g, 'Δ')
    .replace(/\\sigma/g, 'σ')
    .replace(/\\Sigma/g, 'Σ')
    .replace(/\\mu/g, 'μ')
    .replace(/\\lambda/g, 'λ')
    .replace(/\\pi/g, 'π')
    .replace(/\\theta/g, 'θ')
    .replace(/\\omega/g, 'ω')
    .replace(/\\Omega/g, 'Ω')
    .replace(/\\phi/g, 'φ')
    .replace(/\\Phi/g, 'Φ');

  // Fractions: \frac{a}{b} -> (a / b)
  s = s.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1 / $2)');
  // Square root: \sqrt{a} -> √(a)
  s = s.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Brackets
  s = s.replace(/\\left\(/g, '(').replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '[').replace(/\\right\]/g, ']');
  s = s.replace(/\\left\\{/g, '{').replace(/\\right\\}/g, '}');

  // Clean remaining lone backslashes before words or punctuation
  s = s.replace(/\\([a-zA-Z]+)/g, '$1');
  s = s.replace(/\\/g, '');

  return s.trim();
};

const renderMath = (latex: string): React.ReactNode => {
  const cleaned = cleanLatexMath(latex);
  return (
    <span className="font-serif tracking-wide select-all text-indigo-950 dark:text-indigo-200">
      {cleaned}
    </span>
  );
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
    // Matches $$math$$, $math$, \[math\], \(math\), ***bold italic***, **bold**, `code`, [link](url), *italic*, \mathbf{...}, \text{...}
    const regex = /(\$\$[^\$]+\$\$|\$[^\$]+\$|\\\[.+?\\\]|\\\(.+?\\\)|\*\*\*[^*]+\*\*\*|\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*]+\*|\\(?:mathbf|textbf|boldsymbol|mathit|mathrm|text)\{[^}]+\})/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        tokens.push(text.slice(lastIndex, match.index));
      }

      const matchText = match[0];

      if (
        (matchText.startsWith('$') && matchText.endsWith('$')) ||
        (matchText.startsWith('\\[') && matchText.endsWith('\\]')) ||
        (matchText.startsWith('\\(') && matchText.endsWith('\\)'))
      ) {
        tokens.push(
          <span
            key={`math-${match.index}`}
            className="inline-flex items-center gap-1 font-serif text-xs md:text-sm px-2 py-0.5 my-0.5 rounded-md bg-indigo-50/90 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200 border border-indigo-200/80 dark:border-indigo-800/60 shadow-2xs mx-0.5 align-baseline"
          >
            {renderMath(matchText)}
          </span>
        );
      } else if (/^\\(mathbf|textbf|boldsymbol)\{/.test(matchText)) {
        tokens.push(
          <strong
            key={`mb-${match.index}`}
            className="font-bold text-slate-900 dark:text-white"
          >
            {cleanLatexMath(matchText)}
          </strong>
        );
      } else if (/^\\(mathit|textit)\{/.test(matchText)) {
        tokens.push(
          <em
            key={`mi-${match.index}`}
            className="italic text-slate-800 dark:text-slate-200"
          >
            {cleanLatexMath(matchText)}
          </em>
        );
      } else if (/^\\(text|mathrm)\{/.test(matchText)) {
        tokens.push(
          <span
            key={`tx-${match.index}`}
            className="font-sans not-italic text-slate-800 dark:text-slate-200"
          >
            {cleanLatexMath(matchText)}
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

  /**
   * Render a Markdown Table with column alignment, headers, and clean zebra styling
   */
  const renderTable = (rows: string[], keyPrefix: number | string): React.ReactNode => {
    const cleanRows = rows.filter((r) => r.trim().startsWith('|'));
    if (cleanRows.length === 0) return null;

    const parseRow = (rowStr: string): string[] => {
      let s = rowStr.trim();
      if (s.startsWith('|')) s = s.slice(1);
      if (s.endsWith('|')) s = s.slice(0, -1);
      return s.split('|').map((cell) => cell.trim());
    };

    let headerRowIndex = -1;
    let delimiterRowIndex = -1;

    for (let idx = 0; idx < cleanRows.length; idx++) {
      const cells = parseRow(cleanRows[idx]);
      const isDelimiter =
        cells.length > 0 &&
        cells.every((c) => /^:?-+:?$/.test(c.trim().replace(/\s+/g, '')));
      if (isDelimiter) {
        delimiterRowIndex = idx;
        headerRowIndex = idx > 0 ? idx - 1 : -1;
        break;
      }
    }

    let headers: string[] = [];
    let alignDirs: ('left' | 'center' | 'right')[] = [];
    let bodyRows: string[][] = [];

    if (delimiterRowIndex !== -1) {
      const delimiterCells = parseRow(cleanRows[delimiterRowIndex]);
      alignDirs = delimiterCells.map((c) => {
        const tc = c.trim().replace(/\s+/g, '');
        const starts = tc.startsWith(':');
        const ends = tc.endsWith(':');
        if (starts && ends) return 'center';
        if (ends) return 'right';
        return 'left';
      });

      if (headerRowIndex !== -1) {
        headers = parseRow(cleanRows[headerRowIndex]);
      }

      bodyRows = cleanRows
        .filter((_, idx) => idx !== delimiterRowIndex && idx !== headerRowIndex)
        .map(parseRow);
    } else {
      if (cleanRows.length > 1) {
        headers = parseRow(cleanRows[0]);
        bodyRows = cleanRows.slice(1).map(parseRow);
      } else {
        bodyRows = cleanRows.map(parseRow);
      }
    }

    return (
      <div
        key={`table-${keyPrefix}`}
        className="my-3.5 rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs md:text-sm border-collapse">
            {headers.length > 0 && (
              <thead>
                <tr className="bg-slate-100/90 dark:bg-slate-800/90 border-b border-slate-200 dark:border-slate-700/80">
                  {headers.map((h, hIdx) => {
                    const align = alignDirs[hIdx] || 'left';
                    const alignClass =
                      align === 'center'
                        ? 'text-center'
                        : align === 'right'
                        ? 'text-right'
                        : 'text-left';
                    return (
                      <th
                        key={`th-${hIdx}`}
                        className={`px-3.5 py-2.5 font-bold text-slate-800 dark:text-slate-100 text-[11px] uppercase tracking-wider ${alignClass}`}
                      >
                        {renderInline(h)}
                      </th>
                    );
                  })}
                </tr>
              </thead>
            )}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
              {bodyRows.map((r, rIdx) => (
                <tr
                  key={`tr-${rIdx}`}
                  className={`transition-colors hover:bg-indigo-50/40 dark:hover:bg-slate-800/40 ${
                    rIdx % 2 === 0
                      ? 'bg-transparent'
                      : 'bg-slate-50/50 dark:bg-slate-900/40'
                  }`}
                >
                  {r.map((cell, cIdx) => {
                    const align = alignDirs[cIdx] || 'left';
                    const alignClass =
                      align === 'center'
                        ? 'text-center'
                        : align === 'right'
                        ? 'text-right'
                        : 'text-left';
                    return (
                      <td
                        key={`td-${rIdx}-${cIdx}`}
                        className={`px-3.5 py-2.5 text-slate-700 dark:text-slate-300 leading-relaxed align-top ${alignClass}`}
                      >
                        {renderInline(cell)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const isTableRow = (str: string) => {
    const t = str.trim();
    return t.startsWith('|') && (t.endsWith('|') || t.includes('|'));
  };

  const isMathBlock = (str: string) => {
    const t = str.trim();
    if (t.startsWith('$$') && t.endsWith('$$') && t.length >= 4) return true;
    if (t.startsWith('\\[') && t.endsWith('\\]') && t.length >= 4) return true;
    if (/^\\(mathbf|textbf|boldsymbol|mathit|text)\{.*\}$/.test(t)) return true;
    if (t.startsWith('\\begin{') && t.endsWith('}')) return true;
    return false;
  };

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 0. Handle Fenced Code Blocks (```html, ```python, ```, etc.)
    if (!inCodeBlock && trimmed.startsWith('```')) {
      flushList();
      inCodeBlock = true;
      const match = trimmed.match(/^```([a-zA-Z0-9_\-\.\+]*)/);
      codeBlockLang = match ? match[1].toLowerCase() : '';
      codeBlockLines = [];
      i++;
      continue;
    }

    if (inCodeBlock) {
      if (trimmed === '```') {
        elements.push(
          <CodeBlock
            key={`code-${elements.length}-${i}`}
            language={codeBlockLang}
            code={codeBlockLines.join('\n')}
          />
        );
        inCodeBlock = false;
        codeBlockLang = '';
        codeBlockLines = [];
        i++;
        continue;
      }
      // Preserve original line spacing and indentation
      codeBlockLines.push(line);
      i++;
      continue;
    }

    // 1. Markdown Table detection (supports accidental blank lines between rows)
    if (isTableRow(trimmed)) {
      flushList();
      const tableRows: string[] = [];
      while (i < lines.length) {
        const curRow = lines[i].trim();
        if (isTableRow(curRow)) {
          tableRows.push(curRow);
          i++;
        } else if (
          curRow === '' &&
          i + 1 < lines.length &&
          isTableRow(lines[i + 1].trim())
        ) {
          // Skip empty line inside table
          i++;
        } else {
          break;
        }
      }
      elements.push(renderTable(tableRows, elements.length));
      continue;
    }

    // 2. Standalone Math Formula Block (\mathbf{...}, $$, \[, etc.)
    if (isMathBlock(trimmed)) {
      flushList();
      elements.push(
        <div
          key={`mathblock-${elements.length}-${i}`}
          className="my-3 p-3.5 rounded-xl bg-indigo-50/70 dark:bg-slate-900/90 border border-indigo-200/80 dark:border-indigo-800/60 flex items-center justify-center overflow-x-auto shadow-xs text-xs sm:text-sm font-serif font-semibold tracking-wide text-indigo-950 dark:text-indigo-200 text-center select-all"
        >
          {renderMath(trimmed)}
        </div>
      );
      i++;
      continue;
    }

    // 3. Horizontal Rule (---, ***, ___)
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(trimmed)) {
      flushList();
      if (hrCount === 0) {
        hrCount++;
        elements.push(
          <div key={`hr-${i}`} className="my-3.5 flex items-center gap-2.5">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-700 to-slate-200 dark:to-slate-800" />
            <span className="text-[9px] font-black tracking-widest uppercase text-indigo-600/80 dark:text-indigo-400/90 px-1 select-none">
              SAMARTHYA AI
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-transparent via-slate-300 dark:via-slate-700 to-slate-200 dark:to-slate-800" />
          </div>
        );
      } else {
        hrCount++;
        elements.push(
          <div key={`hr-${i}`} className="my-3 border-t border-slate-200/80 dark:border-slate-800" />
        );
      }
      i++;
      continue;
    }

    // 4. Heading 4 (#### Phase 1: ... or #### Heading)
    if (trimmed.startsWith('#### ')) {
      flushList();
      const rawText = trimmed.slice(5).trim();

      // Check for Phase / Step / Week / Milestone pattern
      const phaseMatch = rawText.match(
        /^(Phase\s+\d+|Step\s+\d+|Stage\s+\d+|Week\s+\d+|Module\s+\d+|Part\s+\d+):\s*(.*)$/i
      );

      if (phaseMatch) {
        const phaseLabel = phaseMatch[1];
        const rest = phaseMatch[2].trim();
        const badgeMatch = rest.match(/^(.*?)(?:\s*\(([^)]+)\))$/);
        const titleText = badgeMatch ? badgeMatch[1].trim() : rest;
        const badgeText = badgeMatch ? badgeMatch[2].trim() : null;

        elements.push(
          <div
            key={`h4-phase-${i}`}
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
        elements.push(
          <div key={`h4-${i}`} className="mt-3 mb-1.5 flex items-center gap-2">
            <span className="w-1.5 h-3.5 bg-indigo-500 dark:bg-indigo-400 rounded-sm flex-shrink-0" />
            <h4 className="text-xs md:text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wide">
              {renderInline(rawText)}
            </h4>
          </div>
        );
      }
      i++;
      continue;
    }

    // 5. Heading 3 (### Heading or ### Phase 1: ...)
    if (trimmed.startsWith('### ')) {
      flushList();
      const text = trimmed.slice(4).trim();
      const phaseMatch = text.match(
        /^(Phase\s+\d+|Step\s+\d+|Stage\s+\d+|Week\s+\d+|Module\s+\d+|Part\s+\d+):\s*(.*)$/i
      );
      if (phaseMatch) {
        const phaseLabel = phaseMatch[1];
        const rest = phaseMatch[2].trim();
        const badgeMatch = rest.match(/^(.*?)(?:\s*\(([^)]+)\))$/);
        const titleText = badgeMatch ? badgeMatch[1].trim() : rest;
        const badgeText = badgeMatch ? badgeMatch[2].trim() : null;

        elements.push(
          <div
            key={`h3-phase-${i}`}
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
        i++;
        continue;
      }

      elements.push(
        <div
          key={`h3-${i}`}
          className="mt-4 mb-2 pb-1.5 border-b border-indigo-100 dark:border-indigo-950/80 flex items-center gap-2"
        >
          <span className="w-1.5 h-4.5 bg-gradient-to-b from-indigo-500 to-violet-600 rounded-full flex-shrink-0" />
          <h3 className="text-sm md:text-base font-bold text-indigo-950 dark:text-indigo-200 tracking-tight">
            {renderInline(text)}
          </h3>
        </div>
      );
      i++;
      continue;
    }

    // 6. Heading 2 (## Heading)
    if (trimmed.startsWith('## ')) {
      flushList();
      const text = trimmed.slice(3);
      elements.push(
        <h2
          key={`h2-${i}`}
          className="text-base md:text-lg font-extrabold text-slate-900 dark:text-white mt-4 mb-2 flex items-center gap-2"
        >
          <span className="w-2 h-2 rounded-full bg-indigo-600" />
          <span>{renderInline(text)}</span>
        </h2>
      );
      i++;
      continue;
    }

    // 7. Heading 1 (# Heading)
    if (trimmed.startsWith('# ')) {
      flushList();
      const text = trimmed.slice(2);
      elements.push(
        <h1
          key={`h1-${i}`}
          className="text-lg md:text-xl font-black text-slate-900 dark:text-white mt-4 mb-2"
        >
          {renderInline(text)}
        </h1>
      );
      i++;
      continue;
    }

    // 8. Bullet list item (* Item, - Item, • Item)
    if (/^(\*|\-|\•)\s+/.test(trimmed)) {
      inList = true;
      const bulletContent = trimmed.replace(/^(\*|\-|\•)\s+/, '');

      const compMatch =
        bulletContent.match(/^\*\*(Competency|Competencies):?\*\*:?\s*(.*)$/i) ||
        bulletContent.match(/^(Competency|Competencies):\s*(.*)$/i);

      const overviewMatch =
        bulletContent.match(/^\*\*(Overview|Description|Summary):?\*\*:?\s*(.*)$/i) ||
        bulletContent.match(/^(Overview|Description|Summary):\s*(.*)$/i);

      const isCourseTitle =
        /^\*\*([^*]+)\*\*$/.test(bulletContent) && !compMatch && !overviewMatch;

      if (isCourseTitle) {
        const courseName = bulletContent.slice(2, -2);
        listItems.push(
          <li
            key={`li-${i}`}
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
        const competencyText = compMatch[2];
        listItems.push(
          <li
            key={`li-${i}`}
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
        const overviewText = overviewMatch[2];
        listItems.push(
          <li
            key={`li-${i}`}
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
        listItems.push(
          <li
            key={`li-${i}`}
            className="flex items-start gap-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed py-0.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 mt-1.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">{renderInline(bulletContent)}</div>
          </li>
        );
      }
      i++;
      continue;
    }

    // 9. Multiple Choice Option item (A) ..., B) ..., C) ..., D) ...)
    const optionMatch =
      trimmed.match(/^([A-Da-d])[\)\.]\s+(.*)$/) ||
      trimmed.match(/^\(([A-Da-d])\)\s+(.*)$/);
    if (optionMatch) {
      flushList();
      const letter = optionMatch[1].toUpperCase();
      const optionText = optionMatch[2].trim();

      elements.push(
        <div
          key={`option-${i}`}
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
      i++;
      continue;
    }

    // 10. Numbered list item / Step (1. Item, 2. Item, 3. Item)
    const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (numMatch) {
      flushList();
      const num = numMatch[1];
      const text = numMatch[2].trim();
      const isHeaderLike =
        text.length < 90 &&
        !text.endsWith('.') &&
        !text.endsWith(':') &&
        !text.includes(';\n');

      elements.push(
        <div
          key={`num-${i}`}
          className="flex items-start gap-2.5 my-2 text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
        >
          <span className="font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/60 rounded px-1.5 py-0.5 mt-0.5 flex-shrink-0 shadow-2xs">
            {num}.
          </span>
          <div
            className={`flex-1 min-w-0 ${
              isHeaderLike ? 'font-bold text-slate-900 dark:text-white text-xs md:text-sm' : ''
            }`}
          >
            {renderInline(text)}
          </div>
        </div>
      );
      i++;
      continue;
    }

    // 11. Empty line
    if (!trimmed) {
      flushList();
      elements.push(<div key={`empty-${i}`} className="h-1.5" />);
      i++;
      continue;
    }

    // 12. Normal paragraph
    flushList();
    elements.push(
      <p
        key={`p-${i}`}
        className="text-xs md:text-sm text-slate-700 dark:text-slate-300 leading-relaxed"
      >
        {renderInline(trimmed)}
      </p>
    );
    i++;
  }

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
