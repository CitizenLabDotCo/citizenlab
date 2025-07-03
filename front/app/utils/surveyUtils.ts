import { IFlatCustomField } from 'api/custom_fields/types';

// calculateEstimatedSurveyTime:
// This function calculates the estimated time to complete a survey based on the number of questions and pages.
export const calculateEstimatedSurveyTime = (
  customFields: IFlatCustomField[]
) => {
  // Count # pages
  const pagesCount =
    customFields.filter((field) => field.input_type === 'page').length || 0;

  // Count # questions
  const questionCount = (customFields.length || 0) - pagesCount;

  // Calculate estimated time in seconds, 6 seconds per question and 2 seconds per page
  const estimatedTimeToComplete = 6 * questionCount + 2 * pagesCount;

  // Convert seconds to minutes and return
  return Math.ceil(estimatedTimeToComplete / 60);
};
