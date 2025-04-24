import { PageCategorization } from 'components/Form/typings';
// calculateEstimatedSurveyTime:
// This function calculates the estimated time to complete a survey based on the number of questions and pages.
export const calculateEstimatedSurveyTime = (
  uiSchema: PageCategorization | null
) => {
  // Count # pages
  const pagesCount = uiSchema?.elements.length || 0;

  // Count # questions
  let questionCount = 0;
  uiSchema?.elements.forEach((page) => {
    questionCount += page.elements.length;
  });

  // Calculate estimated time in seconds, 6 seconds per question and 2 seconds per page
  const estimatedTimeToComplete = 6 * questionCount + 2 * pagesCount;

  // Convert seconds to minutes and return
  return Math.round(estimatedTimeToComplete / 60);
};
