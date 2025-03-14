import { Layout } from '@jsonforms/core';

import { IFlatCustomField } from 'api/custom_fields/types';
import { JsonFormsSchema } from 'api/idea_json_form_schema/types';

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

// findFirstSentimentLinearScale:
// Finds the first element with an input_type of 'sentiment_linear_scale' in a uiSchema and returns it.
export function findFirstSentimentLinearScale(
  uiSchema: Layout | null
): any | null {
  if (!uiSchema?.elements) return null; // Ensure schema and elements exist

  let firstQuestionUiSchema = null;

  // Loop through the pages, and find the first Sentiment Scale question
  uiSchema.elements.forEach((page) => {
    const questionMatch = page['elements'].find(
      (element: any) =>
        element.type === 'Control' &&
        element.options?.input_type === 'sentiment_linear_scale'
    );

    if (questionMatch) {
      firstQuestionUiSchema = questionMatch;
    }
  });

  return firstQuestionUiSchema;
}

// We don't want to show any "Optional" label in the popup question title,
// so we make the first question required in the schema here (there is
// no functional impact when answering the question).
export const schemaWithRequiredFirstQuestion = (schema: JsonFormsSchema) => {
  // Get first question key
  const firstQuestionKey = Object.keys(schema.properties)[0];
  // Make the first question required

  if (firstQuestionKey) {
    return {
      ...schema,
      required: [firstQuestionKey],
    };
  }

  return schema;
};
