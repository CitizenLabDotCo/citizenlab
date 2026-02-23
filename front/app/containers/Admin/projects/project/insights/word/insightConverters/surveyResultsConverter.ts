import { Table, Paragraph } from 'docx';
import { MessageDescriptor } from 'react-intl';

import type { ResultUngrouped } from 'api/survey_results/types';

import type { Localize } from 'hooks/useLocalize';

import { FormatMessageValues } from 'utils/cl-intl/useIntl';
import { createSimpleTable } from 'utils/word/converters/tableConverter';
import {
  createHeading,
  createParagraph,
} from 'utils/word/converters/textConverter';

import messages from '../messages';

export interface WordExportIntl {
  formatMessage: (
    descriptor: MessageDescriptor,
    values?: FormatMessageValues
  ) => string;
  locale: string;
  localize: Localize;
}

/**
 * Groups results by page number.
 */
function groupByPage(
  results: ResultUngrouped[]
): Map<number | null, ResultUngrouped[]> {
  const grouped = new Map<number | null, ResultUngrouped[]>();

  for (const result of results) {
    const pageNum = result.pageNumber;
    if (!grouped.has(pageNum)) {
      grouped.set(pageNum, []);
    }
    grouped.get(pageNum)!.push(result);
  }

  return grouped;
}

/**
 * Creates a table for a single question's answers.
 */
function createAnswersTable(
  result: ResultUngrouped,
  intl: WordExportIntl
): Table | null {
  const { formatMessage, localize } = intl;

  // Handle different question types
  if (result.answers && result.answers.length > 0) {
    // For select/checkbox questions with counts
    const rows: string[][] = [
      [formatMessage(messages.answer), formatMessage(messages.count)],
    ];

    for (const answer of result.answers) {
      // Get localized answer text if multilocs available
      let answerText: string;
      if (result.multilocs?.answer && answer.answer !== null) {
        const multiloc =
          result.multilocs.answer[String(answer.answer)].title_multiloc;
        answerText = localize(multiloc) || String(answer.answer);
      } else {
        answerText = answer.answer !== null ? String(answer.answer) : '-';
      }

      rows.push([answerText, String(answer.count)]);
    }

    return createSimpleTable(rows, { columnWidths: [70, 30] });
  }

  if (result.textResponses && result.textResponses.length > 0) {
    // For text questions, show responses as a simple list
    const rows: string[][] = [[formatMessage(messages.responses)]];

    for (const response of result.textResponses.slice(0, 10)) {
      rows.push([response.answer || '-']);
    }

    if (result.textResponses.length > 10) {
      rows.push([`... and ${result.textResponses.length - 10} more responses`]);
    }

    return createSimpleTable(rows, { columnWidths: [100] });
  }

  if (result.numberResponses && result.numberResponses.length > 0) {
    // For number questions
    const rows: string[][] = [[formatMessage(messages.responses)]];

    for (const response of result.numberResponses.slice(0, 10)) {
      rows.push([String(response.answer)]);
    }

    if (result.numberResponses.length > 10) {
      rows.push([
        `... and ${result.numberResponses.length - 10} more responses`,
      ]);
    }

    return createSimpleTable(rows, { columnWidths: [100] });
  }

  if (result.rankings_counts && result.average_rankings) {
    // For ranking questions
    const rows: string[][] = [[formatMessage(messages.answer), 'Average Rank']];

    // Sort by average ranking
    const entries = Object.entries(result.average_rankings).sort(
      (a, b) => parseFloat(a[1]) - parseFloat(b[1])
    );

    for (const [optionId, avgRank] of entries) {
      // Get localized option text
      const answerMultiloc = result.multilocs?.answer[optionId];
      const optionText = answerMultiloc
        ? localize(answerMultiloc.title_multiloc) || optionId
        : optionId;

      rows.push([optionText, `#${avgRank}`]);
    }

    return createSimpleTable(rows, { columnWidths: [70, 30] });
  }

  return null;
}

/**
 * Creates Word document elements for survey results.
 */
export function createSurveyResultsSection(
  results: ResultUngrouped[],
  totalSubmissions: number,
  intl: WordExportIntl
): (Paragraph | Table)[] {
  const { formatMessage, localize } = intl;
  const elements: (Paragraph | Table)[] = [];

  // Section heading
  elements.push(createHeading(formatMessage(messages.questions), 2));

  // Total responses
  const responsesText =
    totalSubmissions > 0
      ? formatMessage(messages.totalResponses, { count: totalSubmissions })
      : formatMessage(messages.noResponses);
  elements.push(createParagraph(responsesText));

  if (totalSubmissions === 0 || results.length === 0) {
    return elements;
  }

  // Group by page
  const groupedByPage = groupByPage(results);

  // Sort pages
  const sortedPages = Array.from(groupedByPage.keys()).sort((a, b) => {
    if (a === null) return -1;
    if (b === null) return 1;
    return a - b;
  });

  for (const pageNum of sortedPages) {
    const pageResults = groupedByPage.get(pageNum) || [];

    // Find page title from first result that has it (pages are separate results with inputType 'page')
    const pageResult = pageResults.find((r) => r.inputType === 'page');

    if (pageNum !== null) {
      const pageTitle = pageResult ? localize(pageResult.question) : '';

      if (pageTitle) {
        elements.push(
          createHeading(
            formatMessage(messages.page, { number: pageNum, title: pageTitle }),
            3
          )
        );
      }
    }

    // Sort questions by questionNumber
    const questions = pageResults
      .filter((r) => r.inputType !== 'page')
      .sort((a, b) => a.questionNumber - b.questionNumber);

    for (const result of questions) {
      // Skip hidden questions
      if (result.hidden) continue;

      const questionText = localize(result.question);
      if (!questionText) continue;

      // Question heading (bold paragraph since level 4 not supported)
      elements.push(
        createParagraph(`${result.questionNumber}. ${questionText}`, {
          bold: true,
        })
      );

      // Response count
      const responseCount = formatMessage(messages.responsesCount, {
        count: result.questionResponseCount,
        total: totalSubmissions,
      });
      elements.push(createParagraph(responseCount, { color: '666666' }));

      // Answers table
      const table = createAnswersTable(result, intl);
      if (table) {
        elements.push(table);
      }
    }
  }

  return elements;
}
