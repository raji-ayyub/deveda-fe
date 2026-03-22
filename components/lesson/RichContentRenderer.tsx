'use client';

import Link from 'next/link';
import { Fragment, ReactNode } from 'react';

type Block =
  | { type: 'heading'; level: 1 | 2 | 3 | 4; content: string }
  | { type: 'paragraph'; content: string }
  | { type: 'blockquote'; content: string[] }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] }
  | { type: 'rule' }
  | { type: 'code'; language: string; content: string };

const FRONTMATTER_RE = /^\s*---[\s\S]*?\n---\s*/;
const INLINE_TOKEN_RE = /(`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|\[([^\]]+)\]\(([^)]+)\))/g;

function renderInline(content: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of content.matchAll(INLINE_TOKEN_RE)) {
    const token = match[0];
    const index = match.index ?? 0;

    if (index > lastIndex) {
      parts.push(<Fragment key={`text-${index}`}>{content.slice(lastIndex, index)}</Fragment>);
    }

    if (token.startsWith('`') && token.endsWith('`')) {
      parts.push(
        <code key={`code-${index}`} className="rounded bg-slate-900/90 px-1.5 py-0.5 font-mono text-[0.92em] text-cyan-100">
          {token.slice(1, -1)}
        </code>
      );
    } else if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      parts.push(
        <strong key={`strong-${index}`} className="font-semibold text-slate-950">
          {token.slice(2, -2)}
        </strong>
      );
    } else if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      parts.push(
        <em key={`em-${index}`} className="italic text-slate-800">
          {token.slice(1, -1)}
        </em>
      );
    } else if (token.startsWith('[') && match[2] && match[3]) {
      const href = match[3];
      const label = match[2];
      const isExternal = /^https?:\/\//i.test(href);
      parts.push(
        <Link
          key={`link-${index}`}
          href={href}
          target={isExternal ? '_blank' : undefined}
          rel={isExternal ? 'noreferrer' : undefined}
          className="font-medium text-blue-700 underline decoration-blue-300 underline-offset-4"
        >
          {label}
        </Link>
      );
    }

    lastIndex = index + token.length;
  }

  if (lastIndex < content.length) {
    parts.push(<Fragment key={`text-tail-${lastIndex}`}>{content.slice(lastIndex)}</Fragment>);
  }

  return parts.length ? parts : [content];
}

function normalizeContent(content: string) {
  return content.replace(/\r/g, '').replace(FRONTMATTER_RE, '').trim();
}

function toBlocks(content: string): Block[] {
  const blocks: Block[] = [];
  const lines = normalizeContent(content).split('\n');
  let paragraphLines: string[] = [];
  let quoteLines: string[] = [];
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

  const flushQuote = () => {
    if (quoteLines.length > 0) {
      blocks.push({ type: 'blockquote', content: [...quoteLines] });
      quoteLines = [];
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
      flushQuote();
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

    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({
        type: 'heading',
        level: headingMatch[1].length as 1 | 2 | 3 | 4,
        content: headingMatch[2],
      });
      continue;
    }

    if (/^(-{3,}|\*{3,})$/.test(trimmed)) {
      flushParagraph();
      flushQuote();
      flushList();
      blocks.push({ type: 'rule' });
      continue;
    }

    if (!trimmed) {
      flushParagraph();
      flushQuote();
      flushList();
      continue;
    }

    const blockquoteMatch = trimmed.match(/^>\s?(.*)$/);
    if (blockquoteMatch) {
      flushParagraph();
      flushList();
      quoteLines.push(blockquoteMatch[1]);
      continue;
    }

    const unorderedMatch = trimmed.match(/^[-*]\s+(.+)$/);
    const orderedMatch = trimmed.match(/^\d+\.\s+(.+)$/);

    if (unorderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'unordered-list') {
        flushList();
      }
      listType = 'unordered-list';
      listItems.push(unorderedMatch[1]);
      continue;
    }

    if (orderedMatch) {
      flushParagraph();
      flushQuote();
      if (listType && listType !== 'ordered-list') {
        flushList();
      }
      listType = 'ordered-list';
      listItems.push(orderedMatch[1]);
      continue;
    }

    flushQuote();
    flushList();
    paragraphLines.push(trimmed);
  }

  flushParagraph();
  flushQuote();
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
          if (block.level === 3) {
            return <h3 key={`heading-${index}`} className="text-lg font-semibold text-slate-950">{block.content}</h3>;
          }
          return <h4 key={`heading-${index}`} className="text-base font-semibold uppercase tracking-[0.12em] text-slate-700">{block.content}</h4>;
        }

        if (block.type === 'paragraph') {
          return (
            <p key={`paragraph-${index}`} className="leading-7 text-slate-700">
              {renderInline(block.content)}
            </p>
          );
        }

        if (block.type === 'blockquote') {
          return (
            <blockquote key={`blockquote-${index}`} className="rounded-r-2xl border-l-4 border-blue-200 bg-blue-50 px-4 py-3 text-slate-700">
              {block.content.map((line, lineIndex) => (
                <p key={`quote-${lineIndex}`} className={lineIndex === 0 ? 'leading-7' : 'mt-2 leading-7'}>
                  {renderInline(line)}
                </p>
              ))}
            </blockquote>
          );
        }

        if (block.type === 'rule') {
          return <hr key={`rule-${index}`} className="border-slate-200" />;
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
