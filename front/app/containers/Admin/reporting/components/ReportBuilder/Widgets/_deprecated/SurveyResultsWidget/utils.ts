import { Result } from 'api/survey_results/types';

export const createResultRows = (
  results: Result[],
  shownQuestions?: boolean[]
) => {
  const shownResults = shownQuestions
    ? results.filter((_, i) => shownQuestions[i])
    : results;

  return shownResults.reduce((acc, result, i) => {
    if (i % 2 === 0) return [...acc, [result]];

    const lastRow = acc[acc.length - 1];
    return [...acc.slice(0, -1), [...lastRow, result]];
  }, []);
};
