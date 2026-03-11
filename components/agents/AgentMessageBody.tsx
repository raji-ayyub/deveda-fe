'use client';

import { Fragment, ReactNode } from 'react';

interface AgentMessageBodyProps {
  content: string;
  className?: string;
}

type Block =
  | { type: 'paragraph'; content: string }
  | { type: 'unordered-list'; items: string[] }
  | { type: 'ordered-list'; items: string[] };

function renderInline(content: string): ReactNode[] {
  const segments = content.split(/(`[^`]+`|\*\*[^*]+\*\*)/g).filter(Boolean);

  return segments.map((segment, index) => {
    if (segment.startsWith('`') && segment.endsWith('`')) {
      return (
        <code key={`${segment}-${index}`} className="rounded bg-black/10 px-1.5 py-0.5 font-mono text-[0.92em]">
          {segment.slice(1, -1)}
        </code>
      );
    }

    if (segment.startsWith('**') && segment.endsWith('**')) {
      return (
        <strong key={`${segment}-${index}`} className="font-semibold">
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

  for (const line of lines) {
    const trimmed = line.trim();
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
  return blocks;
}

export default function AgentMessageBody({ content, className = '' }: AgentMessageBodyProps) {
  const blocks = toBlocks(content);

  return (
    <div className={`space-y-3 ${className}`.trim()}>
      {blocks.map((block, index) => {
        if (block.type === 'paragraph') {
          return (
            <p key={`paragraph-${index}`} className="whitespace-pre-wrap leading-6">
              {renderInline(block.content)}
            </p>
          );
        }

        const ListTag = block.type === 'ordered-list' ? 'ol' : 'ul';
        const listClassName = block.type === 'ordered-list' ? 'ml-5 list-decimal space-y-2' : 'ml-5 list-disc space-y-2';

        return (
          <ListTag key={`${block.type}-${index}`} className={listClassName}>
            {block.items.map((item, itemIndex) => (
              <li key={`${item}-${itemIndex}`} className="leading-6">
                {renderInline(item)}
              </li>
            ))}
          </ListTag>
        );
      })}
    </div>
  );
}
