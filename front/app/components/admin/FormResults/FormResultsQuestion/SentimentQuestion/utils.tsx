import { colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { Multiloc } from 'typings';

import {
  Answer,
  ResultGrouped,
  ResultUngrouped,
} from 'api/survey_results/types';

export type SentimentAnswer = {
  answer: number | null;
  count?: number;
  percentage: number;
  label?: Multiloc;
};

export type SentimentAnswers = SentimentAnswer[] | undefined;

// Calculates the total number of responses in a given group of answers
export const calculateResponseCountForGroup = (answers: Answer[]): number =>
  answers.reduce(
    (total, { count = 0, answer }) => (answer !== null ? total + count : total),
    0
  );

// Parses a grouped survey result into sentiment scores with percentages
export const parseGroupedResult = (
  result: ResultUngrouped | ResultGrouped,
  groupAnswers: Answer[]
): SentimentAnswers => {
  // Only include answers that are not null
  const validAnswers = groupAnswers.filter((a) => a.answer !== null);

  const totalCount = calculateResponseCountForGroup(validAnswers);
  if (totalCount === 0) return [];

  return validAnswers.map(({ answer, count }) => {
    const parsedAnswer =
      answer != null ? parseInt(answer.toString(), 10) : null;

    return {
      answer: parsedAnswer,
      count,
      percentage: count ? Math.round((count / totalCount) * 100) : 0,
      label:
        parsedAnswer != null
          ? result.multilocs?.answer[parsedAnswer].title_multiloc
          : undefined,
    };
  });
};

// parseResult:
// Parses survey results and extracts sentiment-related data.
export const parseResult = (
  result: ResultUngrouped | ResultGrouped
): SentimentAnswers => {
  return result.answers?.map(({ answer, count }) => ({
    answer: answer ? parseInt(answer.toString(), 10) : null,
    count,
    percentage: Math.round((count / result.questionResponseCount) * 100),
    label: answer ? result.multilocs?.answer[answer].title_multiloc : undefined,
  }));
};

// getSentimentGroupColour:
// Retrieves the corresponding color for a sentiment group (low, neutral, high).
export const getSentimentGroupColour = (
  sentimentGroup: string
): string | undefined =>
  ({
    low: colors.red400,
    neutral: colors.grey400,
    high: colors.green400,
  }[sentimentGroup]);

// getSentimentValueColour:
// Retrieves the corresponding color for a specific sentiment value (1-5).
export const getSentimentValueColour = (answer: number): string | undefined =>
  ({
    1: colors.red400,
    2: lighten(0.2, colors.red400),
    3: colors.grey400,
    4: lighten(0.2, colors.green400),
    5: colors.green400,
  }[answer]);

// getPercentageDifference:
// Calculates the percentage difference between two periods.
export const getPercentageDifference = (
  thisPeriodAvg?: number | null,
  lastPeriodAvg?: number | null
): number | null => {
  // Return null if either value is null or undefined
  if (thisPeriodAvg == null || lastPeriodAvg == null) {
    return null;
  }

  // Return 0 if lastPeriodAvg is 0 to avoid division by zero
  if (lastPeriodAvg === 0) {
    return 0;
  }

  // Calculate the percentage difference
  return ((thisPeriodAvg - lastPeriodAvg) / lastPeriodAvg) * 100;
};
