import { Answer, GroupedAnswer } from 'api/survey_results/types';

/**
 * Converts a list of grouped answers into a flat array of answers
 * enriched with group-specific counts based on a fixed legend.
 *
 * Each returned Answer will include one key for each group in the legend,
 * initialized to 0 and populated with actual counts where available.
 *
 * @param answers - Array of grouped answers containing nested group data.
 * @param legend - List of all possible group keys (e.g. ['male', 'female', null]).
 * @returns Array of answers with group count breakdowns.
 */
export function formatAnswersByLegend(
  answers: GroupedAnswer[],
  legend: (string | null)[]
): Answer[] {
  return answers.map((entry) => {
    const row: Answer = {
      answer: entry.answer,
      count: entry.count,
    };

    // Add all legend group keys with default count of 0
    for (const groupKey of legend) {
      const key = groupKey === null ? 'null' : groupKey;
      row[key] = 0;
    }

    // Overwrite with actual group counts where available
    for (const group of entry.groups) {
      const key = group.group === null ? 'null' : group.group;
      row[key] = group.count;
    }

    return row;
  });
}

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
