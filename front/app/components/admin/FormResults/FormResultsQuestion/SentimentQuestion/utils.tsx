import { colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { Multiloc } from 'typings';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

export type SentimentAnswer = {
  answer: number | null;
  count: number;
  percentage: number;
  label: Multiloc | undefined;
};

export type SentimentAnswers = SentimentAnswer[] | undefined;

// parseResult:
// Parses survey results and extracts sentiment-related data.
export const parseResult = (
  result: ResultUngrouped | ResultGrouped
): SentimentAnswers => {
  const usersNoAnswer = result.answers?.[5].count; // Assumes index 5 corresponds to "no answer"
  const totalUsersWhoAnswered = usersNoAnswer
    ? result.totalPickCount - usersNoAnswer
    : result.totalPickCount;

  const { multilocs } = result;

  return result.answers?.map((answer) => {
    const resultValue = answer.answer;

    return {
      answer: resultValue && parseInt(resultValue.toString(), 10),
      count: answer.count,
      percentage: Math.round((answer.count / totalUsersWhoAnswered) * 100),
      label: resultValue && multilocs?.answer[resultValue].title_multiloc,
    };
  });
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
  thisPeriodAvg: number,
  lastPeriodAvg: number
): number => {
  return ((thisPeriodAvg - lastPeriodAvg) / lastPeriodAvg) * 100;
};

// getTrendColorName:
// Determines the trend color based on percentage difference.
export const getTrendColorName = (
  percentageDifference: number
): 'green500' | 'red400' | 'grey700' => {
  if (percentageDifference > 0) {
    return 'green500'; // Positive trend
  } else if (percentageDifference < 0) {
    return 'red400'; // Negative trend
  }
  return 'grey700'; // No change
};
