import { Paragraph, Table } from 'docx';

import type { IIdeaData } from 'api/ideas/types';

import { createSimpleTable } from 'utils/word/converters/tableConverter';
import { createHeading } from 'utils/word/converters/textConverter';

import messages from '../messages';

import type { WordExportIntl } from './types';

/**
 * Creates a most liked ideas/proposals section for the Word document.
 */
export function createMostLikedSection(
  ideas: IIdeaData[],
  intl: WordExportIntl,
  type: 'ideas' | 'proposals' = 'ideas'
): (Paragraph | Table)[] {
  const { formatMessage } = intl;

  if (ideas.length === 0) {
    return [];
  }

  const titleMessage =
    type === 'proposals'
      ? messages.mostLikedProposals
      : messages.mostLikedIdeas;

  const result: (Paragraph | Table)[] = [
    createHeading(formatMessage(titleMessage), 2),
  ];

  // Build table data
  const headers = [
    formatMessage(messages.rank),
    formatMessage(messages.title),
    formatMessage(messages.likes),
  ];

  const rows: (string | number)[][] = [headers];

  ideas.forEach((idea, index) => {
    const title =
      Object.values(idea.attributes.title_multiloc)[0] || 'Untitled';
    const likes = idea.attributes.likes_count || 0;

    rows.push([index + 1, title, likes]);
  });

  result.push(
    createSimpleTable(rows, {
      columnWidths: [10, 70, 20],
    })
  );

  return result;
}
