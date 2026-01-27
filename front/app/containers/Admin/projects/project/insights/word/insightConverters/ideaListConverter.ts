import { Paragraph, Table } from 'docx';

import type { IIdeaData } from 'api/ideas/types';

import { createSimpleTable } from 'utils/word/converters/tableConverter';
import {
  createHeading,
  createParagraph,
} from 'utils/word/converters/textConverter';

import messages from '../messages';

import type { WordExportIntl } from '../useInsightsWordDownload';

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

/**
 * Creates a simple list representation of ideas without a table.
 */
export function createIdeaList(
  ideas: IIdeaData[],
  _intl: WordExportIntl,
  title: string
): (Paragraph | Table)[] {
  if (ideas.length === 0) {
    return [];
  }

  const result: (Paragraph | Table)[] = [createHeading(title, 2)];

  ideas.forEach((idea, index) => {
    const ideaTitle =
      Object.values(idea.attributes.title_multiloc)[0] || 'Untitled';
    const likes = idea.attributes.likes_count || 0;
    const comments = idea.attributes.comments_count || 0;

    result.push(
      createParagraph(
        `${index + 1}. ${ideaTitle} (${likes} likes, ${comments} comments)`,
        { bold: false }
      )
    );
  });

  return result;
}
