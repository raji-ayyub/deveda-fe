'use client';

import { Fragment, ReactNode } from 'react';

type Block =
  | { type: 'heading'; level: 1 | 2 | 3; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'code'; language: string; content: string };

function renderInline(content: string): ReactNode[] {
  const segments = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return (
        <code key={`${segment}-${index}`} className="rounded bg-slate-900/90 px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-100">
          {segment.slice(1, -1)}
        </code>
      );
    }

    if (segment.startsWith('**') && segment.endsWith('**')) {
      return (
        <strong key={`${segment}-${index}`} className="font-semibold text-slate-950">
          {segment.slice(2, -2)}
        </strong>
      );
    }

    return <Fragment key={`${segment}-${index}`}>{segment}</Fragment>;
  });
}

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = content.replace(/\r/g, '').split('\n');
  let paragraphLines: string[] = [];
  let listType: 'unordered-list' | 'ordered-list' | null = null;
  let listItems: string[] = [];
  let codeLanguage = '';
  let codeLines: string[] = [];
  let inCodeBlock = false;

  const flushParagraph = () => {
    if (paragraphLines.length > 0) {
      blocks.push({ type: 'paragraph', content: paragraphLines.join(' ') });
      paragraphLines = [];
    }
  };

  const flushList = () => {
    if (listType && listItems.length > 0) {
      blocks.push({ type: listType, items: [...listItems] });
      listType = null;
      listItems = [];
    }
  };

  const flushCode = () => {
    if (codeLines.length > 0) {
      blocks.push({ type: 'code', language: codeLanguage, content: codeLines.join('\n') });
      codeLanguage = '';
      codeLines = [];
    }
  };

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('```')) {
      flushParagraph();
      flushList();
      if (inCodeBlock) {
        flushCode();
        inCodeBlock = false;
      } else {
        codeLanguage = trimmed.replace('```', '').trim();
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const headingMatch = trimmed.match(/^(#{1,3})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3,
        content: headingMatch[2],
      });
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    if (unorderedMatch) {
      flushParagraph();
      if (listType && listType !== 'unordered-list') {
        flushList();
      }
      listType = 'unordered-list';
      listItems.push(unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      if (listType && listType !== 'ordered-list') {
        flushList();
      }
      listType = 'ordered-list';
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushList();
  flushCode();
  return blocks;
}

export default function RichContentRenderer({ content }: { content: string }) {
  const blocks = toBlocks(content);

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === 'heading') {
          if (block.level === 1) {
            return <h1 key={`heading-${index}`} className="text-2xl font-black tracking-tight text-slate-950">{block.content}</h1>;
          }
          if (block.level === 2) {
            return <h2 key={`heading-${index}`} className="text-xl font-bold text-slate-950">{block.content}</h2>;
          }
          return <h3 key={`heading-${index}`} className="text-lg font-semibold text-slate-950">{block.content}</h3>;
        }

        if (block.type === 'paragraph') {
          return (
            <p key={`paragraph-${index}`} className="leading-7 text-slate-700">
              {renderInline(block.content)}
            </p>
          );
        }

        if (block.type === 'code') {
          return (
            <div key={`code-${index}`} className="overflow-hidden rounded-2xl border border-slate-200 bg-slate-950">
              {block.language ? (
                <div className="border-b border-slate-800 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">
                  {block.language}
                </div>
              ) : null}
              <pre className="overflow-x-auto p-4 text-sm text-slate-100">
                <code>{block.content}</code>
              </pre>
            </div>
          );
        }

        const ListTag = block.type === 'ordered-list' ? 'ol' : 'ul';
        const listClassName =
          block.type === 'ordered-list'
            ? 'ml-5 list-decimal space-y-2 text-slate-700'
            : 'ml-5 list-disc space-y-2 text-slate-700';

        return (
          <ListTag key={`${block.type}-${index}`} className={listClassName}>
            {block.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="leading-7">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
