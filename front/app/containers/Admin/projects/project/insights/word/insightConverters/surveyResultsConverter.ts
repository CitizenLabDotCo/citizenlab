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

export type AISummaryMap = Map<string, string>;

function createAnswersTable(
  result: ResultUngrouped,
  intl: WordExportIntl
): Table | null {
  const { formatMessage, localize } = intl;

  if (result.answers && result.answers.length > 0) {
    const rows: string[][] = [
      [formatMessage(messages.answer), formatMessage(messages.count)],
    ];

    const filteredAnswers = result.answers.filter(
      ({ count, answer }) => !(answer === null && count === 0)
    );

    for (const answer of filteredAnswers) {
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
    const rows: string[][] = [[formatMessage(messages.responses)]];

    for (const response of result.textResponses) {
      rows.push([response.answer || '-']);
    }

    return createSimpleTable(rows, { columnWidths: [100] });
  }

  if (result.numberResponses && result.numberResponses.length > 0) {
    const rows: string[][] = [[formatMessage(messages.responses)]];

    for (const response of result.numberResponses) {
      rows.push([String(response.answer)]);
    }

    return createSimpleTable(rows, { columnWidths: [100] });
  }

  if (result.rankings_counts && result.average_rankings) {
    const rows: string[][] = [[formatMessage(messages.answer), 'Average Rank']];

    const entries = Object.entries(result.average_rankings).sort(
      (a, b) => parseFloat(a[1]) - parseFloat(b[1])
    );

    for (const [optionId, avgRank] of entries) {
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

export function createSurveyResultsSection(
  results: ResultUngrouped[],
  totalSubmissions: number,
  intl: WordExportIntl,
  aiSummaries?: AISummaryMap
): (Paragraph | Table)[] {
  const { formatMessage, localize } = intl;
  const elements: (Paragraph | Table)[] = [];

  elements.push(createHeading(formatMessage(messages.questions), 2));

  const responsesText =
    totalSubmissions > 0
      ? formatMessage(messages.totalResponses, { count: totalSubmissions })
      : formatMessage(messages.noResponses);
  elements.push(createParagraph(responsesText));

  if (totalSubmissions === 0 || results.length === 0) {
    return elements;
  }

  for (const result of results) {
    if (result.inputType === 'page') {
      const pageTitle = localize(result.question);
      const pageNum = result.pageNumber;

      if (pageTitle && pageNum !== null) {
        elements.push(
          createHeading(
            formatMessage(messages.page, { number: pageNum, title: pageTitle }),
            3
          )
        );
      }

      elements.push(
        createParagraph(
          formatMessage(messages.responsesCount, {
            count: result.questionResponseCount,
            total: totalSubmissions,
          }),
          { color: '666666' }
        )
      );
      continue;
    }

    if (result.hidden) continue;

    const questionText = localize(result.question);
    if (!questionText) continue;

    elements.push(
      createParagraph(`${result.questionNumber}. ${questionText}`, {
        bold: true,
      })
    );

    const responseCount = formatMessage(messages.responsesCount, {
      count: result.questionResponseCount,
      total: totalSubmissions,
    });
    elements.push(createParagraph(responseCount, { color: '666666' }));

    const summary = aiSummaries?.get(result.customFieldId);
    if (summary) {
      elements.push(
        createParagraph(`${formatMessage(messages.aiSummary)}: ${summary}`, {
          italic: true,
        })
      );
    }

    const table = createAnswersTable(result, intl);
    if (table) {
      elements.push(table);
    }
  }

  return elements;
}
