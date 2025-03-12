import { colors } from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { Multiloc } from 'typings';

import { ResultGrouped, ResultUngrouped } from 'api/survey_results/types';

export type SentimentAnswer = {
  answer: number | typeof NaN;
  count: number;
  percentage: number;
  label: Multiloc | undefined;
};

export type SentimentAnswers = SentimentAnswer[] | undefined;

export const parseResult = (result: ResultUngrouped | ResultGrouped) => {
  const usersNoAnswer = result.answers?.[5].count;
  const totalUsersWhoAnswered = usersNoAnswer
    ? result.totalPickCount - usersNoAnswer
    : result.totalPickCount;

  const { multilocs } = result;

  const resultsArray = result.answers?.map((answer) => {
    const value = answer.answer;

    return {
      answer: value && parseInt(value.toString(), 10),
      count: answer.count,
      percentage: Math.round((answer.count / totalUsersWhoAnswered) * 100),
      label: value && multilocs?.answer[value].title_multiloc,
    };
  });

  return resultsArray;
};

export const getSentimentGroupColour = (answer: string) =>
  ({
    low: colors.red400,
    neutral: colors.grey400,
    high: colors.green400,
  }[answer] || '');

export const getSentimentValueColour = (answer: number) =>
  ({
    1: colors.red400,
    2: lighten(0.2, colors.red400),
    3: colors.grey400,
    4: lighten(0.2, colors.green400),
    5: colors.green400,
  }[answer] || '');
