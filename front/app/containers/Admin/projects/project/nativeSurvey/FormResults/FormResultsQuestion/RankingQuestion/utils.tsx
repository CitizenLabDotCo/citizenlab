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

export const addResultRanking = (avgRankings: AverageRanking[]) => {
  avgRankings.forEach((avgRanking, index) => {
    const otherRanks = avgRankings
      .filter((_, i) => i !== index)
      .map((avgRanking) => avgRanking.averageRank);

    const resultRank =
      otherRanks.filter((rank) => rank < avgRanking.averageRank).length + 1;

    avgRanking.resultRank = resultRank;
  });
};

export const createAverageRankingsArray = (
  average_rankings: Record<string, string>
) => {
  const avgRankings: AverageRanking[] = [];

  Object.entries(average_rankings).forEach((averageRanking) => {
    avgRankings.push({
      optionKey: averageRanking[0],
      averageRank: parseFloat(averageRanking[1]),
      resultRank: 0,
    });
  });

  // Add the final result rank number for the options
  addResultRanking(avgRankings);

  // Sort the options by average rank
  avgRankings.sort((a, b) => a.averageRank - b.averageRank);

  return avgRankings;
};

export const createOptionsWithRanksArray = (rankings_counts: RankingsCount) => {
  const optionsWithRanks: OptionWithRanks[] = [];

  Object.entries(rankings_counts).forEach((rankingCount, index) => {
    const choicePerRankCounts: [string, number][] = [];

    Object.entries(rankingCount[1]).forEach((rankCount) => {
      choicePerRankCounts.push([rankCount[0], rankCount[1]]);
    });

    optionsWithRanks.push({
      rankValue: index + 1,
      rankOption: rankingCount[0],
      rankCounts: choicePerRankCounts,
    });
  });

  return optionsWithRanks;
};

export const returnPercentageString = (
  rankCount: number,
  totalQuestionResponses: number
) => {
  return `${(((rankCount ? rankCount : 0) / totalQuestionResponses) * 100)
    .toFixed(1)
    .replace(/[.,]0$/, '')}%`;
};
