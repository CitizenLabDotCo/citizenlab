import { IFlatCustomField } from 'api/custom_fields/types';

// calculateEstimatedSurveyTime:
// This function calculates the estimated time to complete a survey based on the number of questions and pages.
export const calculateEstimatedSurveyTime = (
  customFields: IFlatCustomField[] | undefined
) => {
  const pagesCount =
    customFields?.filter((field) => field.input_type === 'page').length || 0;

  const questionCount =
    customFields?.filter((field) => field.input_type !== 'page').length || 0;

  // Calculate estimated time in seconds, 10 seconds per question and 2 seconds per page
  const estimatedTimeToComplete = 10 * questionCount + 2 * pagesCount;

  // Convert seconds to minutes and return
  return Math.round(estimatedTimeToComplete / 60);
};
