export type AverageRanking = {
  resultRank: number;
  optionKey: string;
  averageRank: number;
};

export type RankingsCount = {
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

export const createRankCountsArray = (rankings_counts: object) => {
  const rankingsCounts: RankingsCount[] = [];

  Object.entries(rankings_counts).forEach((rankingCount, index) => {
    const rankCounts: [string, number][] = [];

    Object.entries(rankingCount[1]).forEach((rankCount) => {
      rankCounts.push([rankCount[0], rankCount[1] as number]);
    });

    rankingsCounts.push({
      rankValue: index + 1,
      rankOption: rankingCount[0],
      rankCounts,
    });
  });

  return rankingsCounts;
};

export const returnPercentageString = (
  rankCount: number,
  totalQuestionResponses: number
) => {
  return `${(((rankCount ? rankCount : 0) / totalQuestionResponses) * 100)
    .toFixed(1)
    .replace(/[.,]0$/, '')}%`;
};
