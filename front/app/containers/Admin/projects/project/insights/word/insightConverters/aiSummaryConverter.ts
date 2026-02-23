import { Paragraph, Table } from 'docx';

import {
  createHeading,
  createParagraph,
  createEmptyParagraph,
} from 'utils/word/converters/textConverter';

import messages from '../messages';

import type { WordExportIntl } from './types';

/**
 * Creates an AI summary section for the Word document.
 * Converts markdown-like summary text to Word paragraphs.
 */
export function createAiSummarySection(
  summary: string | null | undefined,
  intl: WordExportIntl
): (Paragraph | Table)[] {
  const { formatMessage } = intl;

  if (!summary) {
    return [];
  }

  const result: (Paragraph | Table)[] = [
    createHeading(formatMessage(messages.aiSummary), 2),
  ];

  // Split summary into paragraphs and convert each
  const paragraphs = summary.split('\n\n').filter((p) => p.trim());

  paragraphs.forEach((text) => {
    // Handle bullet points
    if (text.trim().startsWith('- ') || text.trim().startsWith('* ')) {
      const bulletItems = text.split('\n').filter((line) => line.trim());
      bulletItems.forEach((item) => {
        const cleanItem = item.replace(/^[-*]\s*/, '').trim();
        if (cleanItem) {
          result.push(
            createParagraph(`• ${cleanItem}`, {
              spacing: { before: 40, after: 40 },
            })
          );
        }
      });
    }
    // Handle numbered lists
    else if (/^\d+\.\s/.test(text.trim())) {
      const listItems = text.split('\n').filter((line) => line.trim());
      listItems.forEach((item) => {
        const cleanItem = item.trim();
        if (cleanItem) {
          result.push(
            createParagraph(cleanItem, {
              spacing: { before: 40, after: 40 },
            })
          );
        }
      });
    }
    // Handle headings (lines starting with #)
    else if (text.trim().startsWith('#')) {
      const headingMatch = text.match(/^(#{1,3})\s*(.+)/);
      if (headingMatch) {
        const level = Math.min(headingMatch[1].length, 3) as 1 | 2 | 3;
        const headingText = headingMatch[2].trim();
        result.push(createHeading(headingText, level));
      }
    }
    // Regular paragraph - handle bold/italic markdown
    else {
      const cleanText = text
        .replace(/\*\*(.+?)\*\*/g, '$1') // Remove bold markers
        .replace(/\*(.+?)\*/g, '$1') // Remove italic markers
        .replace(/_(.+?)_/g, '$1') // Remove underscore italic
        .trim();

      if (cleanText) {
        result.push(createParagraph(cleanText));
      }
    }
  });

  result.push(createEmptyParagraph());

  return result;
}
