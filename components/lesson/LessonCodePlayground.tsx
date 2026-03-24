'use client';

import { KeyboardEvent, useEffect, useId, useMemo, useRef, useState } from 'react';
import { CheckCircle2, LoaderCircle, Play, RotateCcw, XCircle } from 'lucide-react';

import { LessonPlayground } from '@/lib/types';

interface LessonCodePlaygroundProps {
  playground: LessonPlayground;
}

type WebTab = 'html' | 'css' | 'js';
type EditorLanguage = WebTab;

const INDENT = '  ';

const WEB_EDITOR_FILES: Record<WebTab, { fileName: string; label: string }> = {
  html: { fileName: 'index.html', label: 'HTML' },
  css: { fileName: 'styles.css', label: 'CSS' },
  js: { fileName: 'script.js', label: 'JavaScript' },
};

const JS_KEYWORDS = new Set([
  'async',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'default',
  'else',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'from',
  'function',
  'if',
  'import',
  'let',
  'new',
  'null',
  'return',
  'super',
  'switch',
  'throw',
  'true',
  'try',
  'typeof',
  'undefined',
  'var',
  'while',
]);

const JS_BUILTINS = new Set([
  'Array',
  'Boolean',
  'console',
  'Date',
  'document',
  'fetch',
  'JSON',
  'Math',
  'Number',
  'Object',
  'Promise',
  'setInterval',
  'setTimeout',
  'String',
  'window',
]);

export default function LessonCodePlayground({ playground }: LessonCodePlaygroundProps) {
  const [activeTab, setActiveTab] = useState<WebTab>('html');
  const [htmlCode, setHtmlCode] = useState(playground.starterHtml || '');
  const [cssCode, setCssCode] = useState(playground.starterCss || '');
  const [jsCode, setJsCode] = useState(playground.starterJs || '');
  const [previewDoc, setPreviewDoc] = useState('');
  const [previewChannelId, setPreviewChannelId] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');
  const previewInstanceIdRef = useRef(`lesson-preview-${Math.random().toString(36).slice(2)}`);

  const loadWebPreview = (nextHtml: string, nextCss: string, nextJs: string, options?: { markRunning?: boolean }) => {
    const nextChannelId = `${previewInstanceIdRef.current}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setPreviewChannelId(nextChannelId);
    setPreviewDoc(buildPreview(nextHtml, nextCss, nextJs, nextChannelId));
    setConsoleOutput([]);
    setRuntimeError('');
    setRunning(options?.markRunning ?? true);
  };

  useEffect(() => {
    setActiveTab('html');
    setHtmlCode(playground.starterHtml || '');
    setCssCode(playground.starterCss || '');
    setJsCode(playground.starterJs || '');
    setConsoleOutput([]);
    setRuntimeError('');
    if (playground.mode === 'web') {
      loadWebPreview(playground.starterHtml || '', playground.starterCss || '', playground.starterJs || '', { markRunning: false });
    } else {
      setPreviewDoc('');
      setPreviewChannelId('');
    }
  }, [playground]);

  useEffect(() => {
    if (typeof window === 'undefined' || !previewChannelId) {
      return;
    }

    const handlePreviewMessage = (event: MessageEvent) => {
      const payload = event.data as
        | {
            source?: string;
            channelId?: string;
            type?: string;
            payload?: { message?: string };
          }
        | undefined;

      if (!payload || payload.source !== 'deveda-playground' || payload.channelId !== previewChannelId) {
        return;
      }

      if (payload.type === 'console') {
        setConsoleOutput((current) => [...current, payload.payload?.message || '']);
        return;
      }

      if (payload.type === 'error') {
        setRuntimeError(payload.payload?.message || 'The code could not run.');
        setRunning(false);
        return;
      }

      if (payload.type === 'done') {
        setRunning(false);
      }
    };

    window.addEventListener('message', handlePreviewMessage);
    return () => window.removeEventListener('message', handlePreviewMessage);
  }, [previewChannelId]);

  const checks = useMemo(() => {
    return playground.checks.map((check) => {
      const passed = evaluateCheck(check, {
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        consoleOutput,
      });
      return { ...check, passed };
    });
  }, [cssCode, htmlCode, jsCode, consoleOutput, playground.checks]);

  const runPlayground = () => {
    setRunning(true);
    setRuntimeError('');
    setConsoleOutput([]);

    try {
      if (playground.mode === 'web') {
        loadWebPreview(htmlCode, cssCode, jsCode);
      } else {
        const logs: string[] = [];
        const consoleStub = {
          log: (...args: unknown[]) => {
            logs.push(args.map((item) => stringifyOutput(item)).join(' '));
          },
        };
        const runner = new Function('console', `"use strict";\n${jsCode}`);
        runner(consoleStub);
        setConsoleOutput(logs);
      }
    } catch (error: any) {
      setRuntimeError(error?.message || 'The code could not run.');
    } finally {
      setRunning(false);
    }
  };

  const resetPlayground = () => {
    setActiveTab('html');
    setHtmlCode(playground.starterHtml || '');
    setCssCode(playground.starterCss || '');
    setJsCode(playground.starterJs || '');
    setConsoleOutput([]);
    setRuntimeError('');
    if (playground.mode === 'web') {
      loadWebPreview(playground.starterHtml || '', playground.starterCss || '', playground.starterJs || '', { markRunning: false });
    }
  };

  const activeFile = WEB_EDITOR_FILES[activeTab];

  return (
    <section className="overflow-hidden rounded-[30px] border border-slate-800 bg-[#020617] shadow-[0_24px_90px_rgba(2,6,23,0.45)]">
      <div className="border-b border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.22),_transparent_32%),linear-gradient(180deg,_rgba(15,23,42,0.95),_rgba(2,6,23,0.95))] p-5 text-slate-100">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-3xl">
            <div className="text-xs font-semibold uppercase tracking-[0.22em] text-cyan-300">Hands-on workspace</div>
            <h3 className="mt-2 text-xl font-bold text-white">Practice with runnable code</h3>
            <p className="mt-2 text-sm text-slate-300">{playground.instructions}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={resetPlayground}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/60 hover:bg-white/10"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={runPlayground}
              className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
              Run
            </button>
          </div>
        </div>
      </div>

      {playground.mode === 'web' ? (
        <div className="grid gap-6 p-5 xl:grid-cols-[1.18fr_0.92fr]">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1220] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                VS Code style workspace
              </div>
            </div>

            <div className="flex overflow-x-auto border-b border-white/10 bg-[#111827]">
              {(['html', 'css', 'js'] as WebTab[]).map((tab) => {
                const file = WEB_EDITOR_FILES[tab];
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`border-r border-white/5 px-4 py-3 text-left transition ${
                      isActive ? 'bg-[#0b1220] text-slate-50' : 'bg-[#111827] text-slate-400 hover:bg-[#0f172a] hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm font-medium">{file.fileName}</div>
                    <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">{file.label}</div>
                  </button>
                );
              })}
            </div>

            <CodeEditor
              fileName={activeFile.fileName}
              label={activeFile.label}
              language={activeTab}
              value={activeTab === 'html' ? htmlCode : activeTab === 'css' ? cssCode : jsCode}
              onChange={(value) => {
                if (activeTab === 'html') {
                  setHtmlCode(value);
                } else if (activeTab === 'css') {
                  setCssCode(value);
                } else {
                  setJsCode(value);
                }
              }}
            />
          </div>

          <div className="space-y-6">
            <OutputPanel title="Preview" subtitle="Live web output">
              <iframe
                key={previewChannelId || 'lesson-playground-preview'}
                title="Lesson playground preview"
                sandbox="allow-scripts"
                srcDoc={previewDoc}
                className="h-[420px] w-full rounded-[20px] border border-slate-800 bg-white"
              />
            </OutputPanel>

            <OutputPanel title="Console output" subtitle="Browser logs and runtime notes">
              <div className="h-[180px] overflow-auto rounded-[20px] border border-slate-800 bg-[#050b16] p-4 font-mono text-sm text-cyan-100">
                {consoleOutput.length > 0 ? consoleOutput.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : 'Run the code to inspect logs and runtime feedback.'}
              </div>
            </OutputPanel>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 p-5 xl:grid-cols-[1.18fr_0.92fr]">
          <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1220] shadow-[inset_0_1px_0_rgba(255,255,255,0.03)]">
            <div className="flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-[#ff5f57]" />
                <span className="h-3 w-3 rounded-full bg-[#febc2e]" />
                <span className="h-3 w-3 rounded-full bg-[#28c840]" />
              </div>
              <div className="rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
                JavaScript runner
              </div>
            </div>

            <CodeEditor fileName="script.js" label="JavaScript" language="js" value={jsCode} onChange={setJsCode} />
          </div>

          <OutputPanel title="Console output" subtitle="Runtime logs">
            <div className="h-[420px] overflow-auto rounded-[20px] border border-slate-800 bg-[#050b16] p-4 font-mono text-sm text-cyan-100">
              {consoleOutput.length > 0 ? consoleOutput.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : 'Run the code to inspect the output.'}
            </div>
          </OutputPanel>
        </div>
      )}

      {runtimeError ? (
        <div className="px-5 pb-1">
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{runtimeError}</div>
        </div>
      ) : null}

      {checks.length > 0 ? (
        <div className="p-5 pt-4">
          <div className="rounded-[24px] border border-white/10 bg-white/5 p-4">
            <div className="text-sm font-semibold text-slate-100">Challenge checks</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              {checks.map((check) => (
                <div key={`${check.label}-${check.value}`} className="flex items-start gap-3 rounded-2xl border border-white/5 bg-[#08101d] px-4 py-3">
                  {check.passed ? (
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="mt-0.5 h-4 w-4 text-slate-500" />
                  )}
                  <div>
                    <div className="text-sm font-semibold text-slate-100">{check.label}</div>
                    <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                      {check.type} in {check.target}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function OutputPanel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[26px] border border-white/10 bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-white/10 bg-[#0f172a] px-4 py-3">
        <div>
          <div className="text-sm font-semibold text-slate-100">{title}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">{subtitle}</div>
        </div>
        <div className="rounded-full bg-white/5 px-3 py-1 text-[11px] font-medium text-slate-400">Ready</div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

function CodeEditor({
  fileName,
  label,
  language,
  value,
  onChange,
}: {
  fileName: string;
  label: string;
  language: EditorLanguage;
  value: string;
  onChange: (value: string) => void;
}) {
  const editorId = useId();
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const highlightRef = useRef<HTMLPreElement | null>(null);
  const lineNumberRef = useRef<HTMLDivElement | null>(null);

  const lineCount = Math.max(value.split('\n').length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1);
  const highlightedCode = useMemo(() => highlightCode(value, language), [language, value]);

  const syncScroll = (textarea: HTMLTextAreaElement) => {
    if (highlightRef.current) {
      highlightRef.current.scrollTop = textarea.scrollTop;
      highlightRef.current.scrollLeft = textarea.scrollLeft;
    }

    if (lineNumberRef.current) {
      lineNumberRef.current.scrollTop = textarea.scrollTop;
    }
  };

  const updateValueAndSelection = (nextValue: string, selectionStart: number, selectionEnd = selectionStart) => {
    onChange(nextValue);
    requestAnimationFrame(() => {
      const textarea = textareaRef.current;
      if (!textarea) {
        return;
      }

      textarea.selectionStart = selectionStart;
      textarea.selectionEnd = selectionEnd;
      syncScroll(textarea);
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = event.currentTarget;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;

    if (event.key === 'Tab') {
      event.preventDefault();
      if (event.shiftKey) {
        outdentSelection(value, selectionStart, selectionEnd, updateValueAndSelection);
      } else {
        indentSelection(value, selectionStart, selectionEnd, updateValueAndSelection);
      }
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      insertNewLineWithIndent(value, selectionStart, selectionEnd, language, updateValueAndSelection);
    }
  };

  return (
    <div className="bg-[#0b1220]">
      <div className="flex items-center justify-between border-b border-white/5 px-4 py-3">
        <div>
          <label htmlFor={editorId} className="text-sm font-medium text-slate-100">
            {fileName}
          </label>
          <div className="mt-0.5 text-[11px] uppercase tracking-[0.18em] text-slate-500">{label}</div>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-300">
          Spaces: 2
        </div>
      </div>

      <div className="flex h-[420px] overflow-hidden">
        <div
          ref={lineNumberRef}
          aria-hidden
          className="w-14 overflow-hidden border-r border-white/5 bg-[#0f172a] px-3 py-4 text-right font-mono text-xs leading-6 text-slate-500"
        >
          {lineNumbers.map((lineNumber) => (
            <div key={lineNumber}>{lineNumber}</div>
          ))}
        </div>

        <div className="relative flex-1 bg-[#0b1220] font-mono text-sm leading-6">
          <pre
            ref={highlightRef}
            aria-hidden
            className="pointer-events-none absolute inset-0 overflow-auto px-4 py-4 text-[#d4d4d4]"
          >
            <code dangerouslySetInnerHTML={{ __html: highlightedCode || ' ' }} />
          </pre>

          <textarea
            id={editorId}
            ref={textareaRef}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={(event) => syncScroll(event.currentTarget)}
            spellCheck={false}
            wrap="off"
            className="absolute inset-0 h-full w-full resize-none overflow-auto bg-transparent px-4 py-4 font-mono text-sm leading-6 text-transparent caret-white outline-none selection:bg-cyan-400/30"
            style={{ WebkitTextFillColor: 'transparent' }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-white/5 px-4 py-2 text-[11px] uppercase tracking-[0.18em] text-slate-500">
        <span>{label}</span>
        <span>{lineCount} lines</span>
      </div>
    </div>
  );
}

function indentSelection(
  source: string,
  selectionStart: number,
  selectionEnd: number,
  applyChange: (value: string, selectionStart: number, selectionEnd?: number) => void
) {
  if (selectionStart === selectionEnd) {
    const nextValue = `${source.slice(0, selectionStart)}${INDENT}${source.slice(selectionEnd)}`;
    applyChange(nextValue, selectionStart + INDENT.length);
    return;
  }

  const startLineStart = getLineStart(source, selectionStart);
  const endLineEnd = getLineEnd(source, selectionEnd);
  const selectedBlock = source.slice(startLineStart, endLineEnd);
  const lineCount = selectedBlock.split('\n').length;
  const indentedBlock = selectedBlock
    .split('\n')
    .map((line) => `${INDENT}${line}`)
    .join('\n');

  const nextValue = `${source.slice(0, startLineStart)}${indentedBlock}${source.slice(endLineEnd)}`;
  const nextSelectionStart = selectionStart + INDENT.length;
  const nextSelectionEnd = selectionEnd + INDENT.length * lineCount;
  applyChange(nextValue, nextSelectionStart, nextSelectionEnd);
}

function outdentSelection(
  source: string,
  selectionStart: number,
  selectionEnd: number,
  applyChange: (value: string, selectionStart: number, selectionEnd?: number) => void
) {
  const startLineStart = getLineStart(source, selectionStart);
  const endLineEnd = getLineEnd(source, selectionEnd);
  const selectedBlock = source.slice(startLineStart, endLineEnd);
  const lines = selectedBlock.split('\n');

  let removedFromFirstLine = 0;
  let totalRemoved = 0;

  const outdentedBlock = lines
    .map((line, index) => {
      if (line.startsWith(INDENT)) {
        totalRemoved += INDENT.length;
        if (index === 0) {
          removedFromFirstLine = INDENT.length;
        }
        return line.slice(INDENT.length);
      }

      if (line.startsWith('\t')) {
        totalRemoved += 1;
        if (index === 0) {
          removedFromFirstLine = 1;
        }
        return line.slice(1);
      }

      return line;
    })
    .join('\n');

  if (totalRemoved === 0) {
    return;
  }

  const nextValue = `${source.slice(0, startLineStart)}${outdentedBlock}${source.slice(endLineEnd)}`;
  const nextSelectionStart =
    selectionStart === selectionEnd ? Math.max(startLineStart, selectionStart - removedFromFirstLine) : Math.max(startLineStart, selectionStart - removedFromFirstLine);
  const nextSelectionEnd = Math.max(nextSelectionStart, selectionEnd - totalRemoved);
  applyChange(nextValue, nextSelectionStart, nextSelectionEnd);
}

function insertNewLineWithIndent(
  source: string,
  selectionStart: number,
  selectionEnd: number,
  language: EditorLanguage,
  applyChange: (value: string, selectionStart: number, selectionEnd?: number) => void
) {
  const currentLineStart = getLineStart(source, selectionStart);
  const currentLineEnd = getLineEnd(source, selectionStart);
  const currentLine = source.slice(currentLineStart, currentLineEnd);
  const leadingWhitespace = currentLine.match(/^\s*/)?.[0] || '';
  const beforeCursor = source.slice(currentLineStart, selectionStart).trimEnd();
  const afterCursor = source.slice(selectionEnd, currentLineEnd).trimStart();

  const shouldIndent = opensIndent(beforeCursor, language);
  const nextIndent = shouldIndent ? `${leadingWhitespace}${INDENT}` : leadingWhitespace;
  const splitCloser = shouldIndent && closesIndent(afterCursor, language);

  const insertion = splitCloser ? `\n${nextIndent}\n${leadingWhitespace}` : `\n${nextIndent}`;
  const nextValue = `${source.slice(0, selectionStart)}${insertion}${source.slice(selectionEnd)}`;
  const cursorPosition = selectionStart + 1 + nextIndent.length;
  applyChange(nextValue, cursorPosition);
}

function opensIndent(content: string, language: EditorLanguage) {
  if (language === 'html') {
    return /<([A-Za-z][\w:-]*)(?:\s[^<>]*)?>$/.test(content) && !/\/>$/.test(content);
  }

  return /[{([]$/.test(content) || /=>$/.test(content);
}

function closesIndent(content: string, language: EditorLanguage) {
  if (language === 'html') {
    return /^<\//.test(content);
  }

  return /^[}\])]/.test(content);
}

function getLineStart(source: string, position: number) {
  return source.lastIndexOf('\n', Math.max(position - 1, 0)) + 1;
}

function getLineEnd(source: string, position: number) {
  const lineEnd = source.indexOf('\n', position);
  return lineEnd === -1 ? source.length : lineEnd;
}

function highlightCode(source: string, language: EditorLanguage) {
  if (!source) {
    return ' ';
  }

  if (language === 'html') {
    return renderTokenizedCode(
      source,
      /<!--[\s\S]*?-->|<\/?[\w:-]+|\/?>|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_:][\w:.-]*(?==)|\s+|./g,
      (token) => {
        if (token.startsWith('<!--')) {
          return 'text-[#6a9955]';
        }

        if (token.startsWith('<')) {
          return 'text-[#569cd6]';
        }

        if (token === '>' || token === '/>') {
          return 'text-[#808b9a]';
        }

        if (token.startsWith('"') || token.startsWith("'")) {
          return 'text-[#ce9178]';
        }

        if (/^[A-Za-z_:][\w:.-]*$/.test(token)) {
          return 'text-[#9cdcfe]';
        }

        return '';
      }
    );
  }

  if (language === 'css') {
    return renderTokenizedCode(
      source,
      /\/\*[\s\S]*?\*\/|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|rem|em|vh|vw|%|deg|s|ms)?\b|@[A-Za-z_-][\w-]*|\.[A-Za-z_-][\w-]*|#[A-Za-z_-][\w-]*|[A-Za-z_-][\w-]*(?=\s*:)|[{}():;,.>+~]+|\s+|./g,
      (token) => {
        if (token.startsWith('/*')) {
          return 'text-[#6a9955]';
        }

        if (token.startsWith('"') || token.startsWith("'")) {
          return 'text-[#ce9178]';
        }

        if (/^#[0-9a-fA-F]{3,8}$/.test(token)) {
          return 'text-[#4ec9b0]';
        }

        if (/^\d/.test(token)) {
          return 'text-[#b5cea8]';
        }

        if (token.startsWith('@')) {
          return 'text-[#c586c0]';
        }

        if (token.startsWith('.') || (/^#[A-Za-z_-]/.test(token) && !/^#[0-9a-fA-F]{3,8}$/.test(token))) {
          return 'text-[#d7ba7d]';
        }

        if (/^[A-Za-z_-][\w-]*$/.test(token)) {
          return 'text-[#9cdcfe]';
        }

        if (/^[{}():;,.>+~]+$/.test(token)) {
          return 'text-[#808b9a]';
        }

        return '';
      }
    );
  }

  return renderTokenizedCode(
    source,
    /\/\*[\s\S]*?\*\/|\/\/.*|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`|\b[A-Za-z_$][\w$]*\b|\b\d+(?:\.\d+)?\b|[{}()[\].,;:+\-*/=<>!&|%]+|\s+|./g,
    (token) => {
      if (token.startsWith('/*') || token.startsWith('//')) {
        return 'text-[#6a9955]';
      }

      if (token.startsWith('"') || token.startsWith("'") || token.startsWith('`')) {
        return 'text-[#ce9178]';
      }

      if (/^\d/.test(token)) {
        return 'text-[#b5cea8]';
      }

      if (JS_KEYWORDS.has(token)) {
        return 'text-[#c586c0]';
      }

      if (JS_BUILTINS.has(token) || /^[A-Z][A-Za-z0-9_$]*$/.test(token)) {
        return 'text-[#4ec9b0]';
      }

      if (/^[{}()[\].,;:+\-*/=<>!&|%]+$/.test(token)) {
        return 'text-[#808b9a]';
      }

      return '';
    }
  );
}

function renderTokenizedCode(
  source: string,
  pattern: RegExp,
  classifyToken: (token: string) => string
) {
  let highlighted = '';
  let match: RegExpExecArray | null;

  pattern.lastIndex = 0;

  while ((match = pattern.exec(source)) !== null) {
    const token = match[0];
    const className = classifyToken(token);
    const escapedToken = escapeHtml(token);
    highlighted += className ? `<span class="${className}">${escapedToken}</span>` : escapedToken;
  }

  return highlighted;
}

function escapeHtml(source: string) {
  return source
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildPreview(html: string, css: string, js: string, channelId: string) {
  const safeChannelId = JSON.stringify(channelId);
  const safeJs = escapeInlineScript(js);
  return `<!doctype html>
<html>
  <head>
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      (function () {
        const channelId = ${safeChannelId};
        const postToParent = (type, payload) => {
          window.parent.postMessage({ source: 'deveda-playground', channelId, type, payload }, '*');
        };

        const formatValue = (value) => {
          if (typeof value === 'string') {
            return value;
          }

          try {
            return JSON.stringify(value);
          } catch {
            return String(value);
          }
        };

        const nativeConsole = window.console;
        window.console = {
          ...nativeConsole,
          log: (...args) => {
            postToParent('console', { message: args.map(formatValue).join(' ') });
            nativeConsole.log(...args);
          },
          warn: (...args) => {
            postToParent('console', { message: args.map(formatValue).join(' ') });
            nativeConsole.warn(...args);
          },
          error: (...args) => {
            postToParent('console', { message: args.map(formatValue).join(' ') });
            nativeConsole.error(...args);
          },
        };

        window.addEventListener('error', (event) => {
          postToParent('error', { message: event.error?.message || event.message || 'The code could not run.' });
        });

        window.addEventListener('unhandledrejection', (event) => {
          const reason = event.reason;
          postToParent('error', { message: reason?.message || String(reason) });
        });

        try {
          ${safeJs}
        } catch (error) {
          postToParent('error', { message: error?.message || String(error) });
        } finally {
          postToParent('done', {});
        }
      }());
    </script>
  </body>
</html>`;
}

function evaluateCheck(
  check: LessonPlayground['checks'][number],
  state: { html: string; css: string; js: string; consoleOutput: string[] }
) {
  if (check.target === 'console') {
    return state.consoleOutput.some((line) => line.includes(check.value));
  }

  const targetContent = check.target === 'html' ? state.html : check.target === 'css' ? state.css : state.js;

  return targetContent.includes(check.value);
}

function stringifyOutput(value: unknown) {
  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function escapeInlineScript(source: string) {
  return source.replace(/<\/script/gi, '<\\/script');
}
