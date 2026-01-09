import { ResultUngrouped } from 'api/survey_results/types';

export interface ResultGroup {
  page: ResultUngrouped | null;
  firstQuestion: ResultUngrouped | null;
  remainingQuestions: ResultUngrouped[];
}

/**
 * Groups survey results for PDF export with proper page breaks.
 * Each group contains a page header + first question (kept together in PageBreakBox)
 * and remaining questions rendered separately.
 */
export const groupResultsForPdfExport = (
  results: ResultUngrouped[]
): ResultGroup[] => {
  const groups: ResultGroup[] = [];
  let currentGroup: ResultGroup = {
    page: null,
    firstQuestion: null,
    remainingQuestions: [],
  };

  const hasContent = (group: ResultGroup) =>
    group.page || group.firstQuestion || group.remainingQuestions.length > 0;

  results.forEach((result) => {
    if (result.inputType === 'page') {
      if (hasContent(currentGroup)) {
        groups.push(currentGroup);
      }
      currentGroup = {
        page: result,
        firstQuestion: null,
        remainingQuestions: [],
      };
    } else if (currentGroup.page && !currentGroup.firstQuestion) {
      currentGroup.firstQuestion = result;
    } else {
      currentGroup.remainingQuestions.push(result);
    }
  });

  if (hasContent(currentGroup)) {
    groups.push(currentGroup);
  }

  return groups;
};
