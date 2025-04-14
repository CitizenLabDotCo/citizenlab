import { Answer, GroupedAnswer } from 'api/survey_results/types';

import { calculateResponseCountForGroup, SentimentAnswers } from '../../utils';

// transformGroupedAnswerUsableArray:
// Description: Converts a grouped answer into a more usable array.
export function transformGroupedAnswerUsableArray(
  groupedAnswer: GroupedAnswer[],
  groupKey: string
): Answer[] {
  // Map each entry to its count for the specified group
  const answersForSpecificGroup = groupedAnswer.map((entry) => {
    const groupAnswer = entry.groups.find((group) => group.group === groupKey);

    return {
      answer: entry.answer,
      count: groupAnswer?.count || 0,
    };
  });

  return answersForSpecificGroup;
}

// getAverageValue
// Description: Helper function to calculate average sentiment
export const getAverageValue = (
  groupAnswers: SentimentAnswers,
  groupAnswersArray?: ReturnType<typeof transformGroupedAnswerUsableArray>
): number | undefined => {
  const totalResponses =
    groupAnswersArray && calculateResponseCountForGroup(groupAnswersArray);

  const totalValue = groupAnswers?.reduce((acc, { answer, count }) => {
    return answer && count ? acc + answer * count : acc;
  }, 0);

  return totalResponses && totalValue && totalResponses > 0
    ? parseFloat((totalValue / totalResponses).toFixed(1))
    : undefined;
};
