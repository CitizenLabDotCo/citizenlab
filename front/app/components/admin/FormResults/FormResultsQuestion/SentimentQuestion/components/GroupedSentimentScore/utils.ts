import { Answer, GroupedAnswer } from 'api/survey_results/types';

/**
 * Reduces a full set of grouped answers down to counts for a specific group.
 * This is useful for filtering sentiment or response data by demographic group.
 *
 * @param groupedAnswer - Full array of grouped answers.
 * @param groupKey - Specific group key to extract (e.g. 'female').
 * @returns A simplified array of { answer, count } for the specified group.
 */
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
