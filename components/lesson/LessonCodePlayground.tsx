'use client';

import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, LoaderCircle, Play, RotateCcw, XCircle } from 'lucide-react';

import { LessonPlayground } from '@/lib/types';

interface LessonCodePlaygroundProps {
  playground: LessonPlayground;
}

type WebTab = 'html' | 'css' | 'js';

export default function LessonCodePlayground({ playground }: LessonCodePlaygroundProps) {
  const [activeTab, setActiveTab] = useState<WebTab>('html');
  const [htmlCode, setHtmlCode] = useState(playground.starterHtml || '');
  const [cssCode, setCssCode] = useState(playground.starterCss || '');
  const [jsCode, setJsCode] = useState(playground.starterJs || '');
  const [previewDoc, setPreviewDoc] = useState('');
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [runtimeError, setRuntimeError] = useState('');

  useEffect(() => {
    setHtmlCode(playground.starterHtml || '');
    setCssCode(playground.starterCss || '');
    setJsCode(playground.starterJs || '');
    setConsoleOutput([]);
    setRuntimeError('');
    if (playground.mode === 'web') {
      setPreviewDoc(buildPreview(playground.starterHtml || '', playground.starterCss || '', playground.starterJs || ''));
    }
  }, [playground]);

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

    try {
      if (playground.mode === 'web') {
        setPreviewDoc(buildPreview(htmlCode, cssCode, jsCode));
        setConsoleOutput([]);
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
    setHtmlCode(playground.starterHtml || '');
    setCssCode(playground.starterCss || '');
    setJsCode(playground.starterJs || '');
    setConsoleOutput([]);
    setRuntimeError('');
    if (playground.mode === 'web') {
      setPreviewDoc(buildPreview(playground.starterHtml || '', playground.starterCss || '', playground.starterJs || ''));
    }
  };

  return (
    <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-100">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">Hands-on workspace</div>
          <h3 className="mt-2 text-xl font-bold text-slate-950">Practice with runnable code</h3>
          <p className="mt-2 text-sm text-slate-600">{playground.instructions}</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetPlayground}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            onClick={runPlayground}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            {running ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            Run
          </button>
        </div>
      </div>

      {playground.mode === 'web' ? (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {(['html', 'css', 'js'] as WebTab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] transition ${
                    activeTab === tab ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <CodeEditor
              label={activeTab.toUpperCase()}
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

          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Preview</div>
            <iframe
              title="Lesson playground preview"
              sandbox="allow-scripts"
              srcDoc={previewDoc}
              className="mt-4 h-[360px] w-full rounded-2xl border border-slate-200 bg-white"
            />
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_1fr]">
          <CodeEditor label="JavaScript" value={jsCode} onChange={setJsCode} />
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <div className="text-sm font-semibold text-slate-900">Console output</div>
            <div className="mt-4 min-h-[360px] rounded-2xl bg-slate-950 p-4 font-mono text-sm text-cyan-100">
              {consoleOutput.length > 0 ? consoleOutput.map((line, index) => <div key={`${line}-${index}`}>{line}</div>) : 'Run the code to inspect the output.'}
            </div>
          </div>
        </div>
      )}

      {runtimeError ? (
        <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {runtimeError}
        </div>
      ) : null}

      {checks.length > 0 ? (
        <div className="mt-6 rounded-[24px] border border-slate-200 bg-slate-50 p-4">
          <div className="text-sm font-semibold text-slate-900">Challenge checks</div>
          <div className="mt-3 space-y-3">
            {checks.map((check) => (
              <div key={`${check.label}-${check.value}`} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                {check.passed ? (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-600" />
                ) : (
                  <XCircle className="mt-0.5 h-4 w-4 text-slate-300" />
                )}
                <div>
                  <div className="text-sm font-semibold text-slate-900">{check.label}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-500">
                    {check.type} in {check.target}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CodeEditor({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-slate-950 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-200">{label}</div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        className="h-[360px] w-full resize-none rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 font-mono text-sm text-slate-100 outline-none focus:border-cyan-400"
      />
    </div>
  );
}

function buildPreview(html: string, css: string, js: string) {
  return `<!doctype html>
<html>
  <head>
    <style>${css}</style>
  </head>
  <body>
    ${html}
    <script>
      try {
        ${js}
      } catch (error) {
        document.body.insertAdjacentHTML('beforeend', '<pre style="color:#b91c1c;font-family:monospace;">' + error.message + '</pre>');
      }
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

  const targetContent =
    check.target === 'html'
      ? state.html
      : check.target === 'css'
      ? state.css
      : state.js;

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
