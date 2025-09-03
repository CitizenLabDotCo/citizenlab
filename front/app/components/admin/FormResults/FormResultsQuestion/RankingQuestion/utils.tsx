import { AverageRankings, RankingsCounts } from 'api/survey_results/types';

export type OptionAverageRank = {
  resultRank: number;
  optionKey: string;
  averageRank: number;
};

export type OptionDetailedRanks = {
  optionKey: string;
  rankCounts: [string, number][];
};

// createOptionsWithAverageRanks
// Description: Creates an array of objects from the average_rankings result object.
export const createOptionsWithAverageRanks = (
  average_rankings: AverageRankings
) => {
  const optionsWithRanks: OptionAverageRank[] = [];

  Object.entries(average_rankings).forEach((averageRanking) => {
    optionsWithRanks.push({
      optionKey: averageRanking[0],
      averageRank: parseFloat(averageRanking[1]),
      resultRank: 0,
    });
  });

  // Add the final result rank number for the options to the array
  addResultRanking(optionsWithRanks);

  // Sort the options by average rank
  optionsWithRanks.sort((a, b) => a.averageRank - b.averageRank);

  return optionsWithRanks;
};

// addResultRanking
// Description: Adds the final result rank number (E.g. #1, #2, etc.) for the options based on the average ranks.
export const addResultRanking = (optionArrayWithRanks: OptionAverageRank[]) => {
  optionArrayWithRanks.forEach((option, index) => {
    // Get array of options without the current option
    const otherOptionsWithRanks = optionArrayWithRanks.filter(
      (_, i) => i !== index
    );

    // Calculate the resulting rank number for the option
    const resultRank =
      otherOptionsWithRanks.filter(
        (rank) => rank.averageRank < option.averageRank
      ).length + 1;

    // Update the orginal array option with the result rank
    option.resultRank = resultRank;
  });
};

// createOptionsWithRanksArray
// Description: Creates an array of objects from the rankings_counts result object.
export const createOptionsWithDetailedRanks = (
  rankings_counts: RankingsCounts
) => {
  const optionsWithDetailedRanks: OptionDetailedRanks[] = [];

  Object.entries(rankings_counts).forEach((rankingCount) => {
    // Note:
    // rankingCount[0] = Option key
    // rankingCount[1] = Object containing all rank values and the number of times they were chosen for the option.

    const choicePerRankCounts: [string, number][] = [];

    Object.entries(rankingCount[1]).forEach((rankCount) => {
      choicePerRankCounts.push([rankCount[0], rankCount[1]]);
    });

    optionsWithDetailedRanks.push({
      optionKey: rankingCount[0],
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
  return `${parseFloat(
    (((rankCount ? rankCount : 0) / totalQuestionResponses) * 100).toFixed(1)
  )}%`;
};
