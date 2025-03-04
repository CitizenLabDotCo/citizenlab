import { Multiloc } from 'typings';

import { ResultUngrouped } from 'api/survey_results/types';

export type SentimentAnswers =
  | {
      answer: number;
      count: number;
      percentage: number;
      label: string | Multiloc | undefined;
    }[]
  | undefined;

export const parseResult = (result: ResultUngrouped) => {
  const usersNoAnswer = result.answers?.[5].count;
  const totalUsersWhoAnswered = usersNoAnswer
    ? result.totalPickCount - usersNoAnswer
    : result.totalPickCount;

  const { multilocs } = result;

  const resultsArray = result.answers?.map((answer) => {
    return {
      answer: parseInt(answer.answer?.toString() || '', 10),
      count: answer.count,
      percentage: Math.round((answer.count / totalUsersWhoAnswered) * 100),
      label:
        answer.answer === null
          ? 'No answer'
          : multilocs?.answer[answer.answer].title_multiloc,
    };
  });

  return resultsArray;
};
