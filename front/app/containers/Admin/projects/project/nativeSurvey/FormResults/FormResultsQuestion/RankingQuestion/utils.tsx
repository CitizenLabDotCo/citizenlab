import { RankingsCount } from 'api/survey_results/types';

export type AverageRanking = {
  resultRank: number;
  optionKey: string;
  averageRank: number;
};

export type OptionWithRanks = {
  rankValue: number;
  rankOption: string;
  rankCounts: [string, number][];
};

// addResultRanking
// Description: Adds the final result rank number (E.g. #1, #2, etc.) for the options based on the average ranks.
export const addResultRanking = (optionArrayWithRanks: AverageRanking[]) => {
  optionArrayWithRanks.forEach((option, index) => {
    const otherRanks = optionArrayWithRanks
      .filter((_, i) => i !== index)
      .map((option) => option.averageRank);

    const resultRank =
      otherRanks.filter((rank) => rank < option.averageRank).length + 1;

    option.resultRank = resultRank;
  });
};

// createOptionsWithAverageRanks
// Description: Creates an array of objects from the average_rankings result object.
export const createOptionsWithAverageRanks = (
  average_rankings: Record<string, string>
) => {
  const optionsWithRanks: AverageRanking[] = [];

  Object.entries(average_rankings).forEach((averageRanking) => {
    optionsWithRanks.push({
      optionKey: averageRanking[0],
      averageRank: parseFloat(averageRanking[1]),
      resultRank: 0,
    });
  });

  // Add the final result rank number for the options
  addResultRanking(optionsWithRanks);

  // Sort the options by average rank
  optionsWithRanks.sort((a, b) => a.averageRank - b.averageRank);

  return optionsWithRanks;
};

// createOptionsWithRanksArray
// Description: Creates an array of objects from the rankings_counts result object.
export const createOptionsWithDetailedRanks = (
  rankings_counts: RankingsCount
) => {
  const optionsWithDetailedRanks: OptionWithRanks[] = [];

  Object.entries(rankings_counts).forEach((rankingCount, index) => {
    // Note:
    // rankingCount[0] = Option key
    // rankingCount[1] = Object containing all rank values and the number of times they were chosen for the option.

    const choicePerRankCounts: [string, number][] = [];

    Object.entries(rankingCount[1]).forEach((rankCount) => {
      choicePerRankCounts.push([rankCount[0], rankCount[1]]);
    });

    optionsWithDetailedRanks.push({
      rankValue: index + 1,
      rankOption: rankingCount[0],
      rankCounts: choicePerRankCounts,
    });
  });

  return optionsWithDetailedRanks;
};

// returnPercentageString
// Description: Returns a string with the percentage value of the rank count to 1 decimal point.
export const returnRankPercentageString = (
  rankCount: number,
  totalQuestionResponses: number
) => {
  return `${(((rankCount ? rankCount : 0) / totalQuestionResponses) * 100)
    .toFixed(1)
    .replace(/[.,]0$/, '')}%`;
};
