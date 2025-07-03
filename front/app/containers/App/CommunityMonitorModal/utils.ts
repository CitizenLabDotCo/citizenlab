import { Layout, UISchemaElement } from '@jsonforms/core';

// findFirstSentimentLinearScale:
// Finds the first element with an input_type of 'sentiment_linear_scale' in a uiSchema and returns it.
export function findFirstSentimentLinearScale(
  uiSchema: Layout | null
): any | null {
  if (!uiSchema?.elements) return null; // Ensure schema and elements exist

  let firstQuestionUiSchema: UISchemaElement | null = null;

  // Loop through the pages, and find the first Sentiment Scale question
  uiSchema.elements.forEach((page) => {
    if (firstQuestionUiSchema) return; // We already found the first question

    const questionMatch = page['elements'].find(
      (element: UISchemaElement) =>
        element.type === 'Control' &&
        element.options?.input_type === 'sentiment_linear_scale'
    );

    if (questionMatch) {
      firstQuestionUiSchema = questionMatch;
    }
  });

  return firstQuestionUiSchema;
}

// isAllowedOnUrl:
// This function checks if the user is on a custom page or the homepage.
export const isAllowedOnUrl = (location: string) => {
  // If the user is on a custom page or the homepage, we can show the modal
  const customPageRegex = '/pages/';
  const homepageRegex = /^\/[a-zA-Z]{2}\/(?!\w)/;

  return location.match(customPageRegex) || location.match(homepageRegex);
};
