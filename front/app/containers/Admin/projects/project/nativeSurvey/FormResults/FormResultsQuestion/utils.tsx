import { ICustomFieldInputType } from 'api/custom_fields/types';
import { ResultUngrouped } from 'api/survey_results/types';

// determineAnswerType
// This function returns the type of answer based on the result object and
// whether there are any answers present.
export const determineAnswerType = (
  result: ResultUngrouped
): ICustomFieldInputType | undefined => {
  const {
    answers,
    average_rankings,
    textResponses,
    pointResponses,
    lineResponses,
    polygonResponses,
    numberResponses,
  } = result;

  if (average_rankings) {
    return 'ranking';
  }
  if (answers) {
    return 'multiselect';
  }
  if (textResponses && textResponses.length > 0) {
    return 'text';
  }
  if (numberResponses && numberResponses.length > 0) {
    return 'number';
  }
  if (pointResponses && pointResponses.length > 0) {
    return 'point';
  }
  if (lineResponses && lineResponses.length > 0) {
    return 'line';
  }
  if (polygonResponses && polygonResponses.length > 0) {
    return 'polygon';
  }

  return undefined;
};
