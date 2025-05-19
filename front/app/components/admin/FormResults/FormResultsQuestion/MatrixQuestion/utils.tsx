import { colors, Td } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import {
  MatrixLinearScaleAnswer,
  MatrixLinearScaleResult,
  ResultUngrouped,
} from 'api/survey_results/types';

import { hexToRGBA } from 'utils/helperUtils';

// STYLED COMPONENTS
export const StickyTd = styled(Td)`
  max-width: 180px;
  position: sticky;
  inset-inline-start: 0px;
  background: white;
  z-index: 1;
  flex-grow: 1;
`;

// StyledTd needed so the report pdf has the correct colours
export const StyledTd = styled(Td)`
  -webkit-print-color-adjust: exact;
`;

// TYPES
export type StatementWithResult = {
  statementKey: string;
  statementMultiloc: Multiloc;
  answers: MatrixLinearScaleAnswer[];
};

export type LinearScaleMultilocs = {
  value: number;
  label: Multiloc;
};

// FUNCTIONS

// getPrimaryColourByPercentage
// Description: Return primary colour and alpha based on a percentage
export const getPrimaryColourByPercentage = (percentage: number) => {
  // Return primary colour and alpha based on a percentage
  return hexToRGBA(colors.primary, percentage === 0 ? 0.05 : percentage / 100);
};

// getPercentageTextBorder
// Description: Return text border style based on a percentage
export const getPercentageTextBorder = (percentage: number) => {
  const textBorderColor = percentage >= 75 ? colors.textPrimary : 'white';

  return `-1px 0 ${textBorderColor}, 0 1px ${textBorderColor}, 1px 0 ${textBorderColor}, 0 -1px ${textBorderColor}`;
};

// getPercentage
// Description: Return percentage based on statementWithResult and linearScaleMultiloc
export const getPercentage = (
  statementWithResult: StatementWithResult,
  linearScaleMultiloc: LinearScaleMultilocs
) => {
  let percentage = statementWithResult.answers.find(
    (answer) => answer.answer === linearScaleMultiloc.value
  )?.percentage;

  // Reduce decimal points to two and return
  if (percentage) {
    percentage = percentage * 100;
    return parseFloat(percentage.toFixed(2));
  }

  return 0;
};

// getStatementsWithResultsArray
// Description: Return a results array based on result object.
export const getStatementsWithResultsArray = (result: ResultUngrouped) => {
  const statementsWithResults: StatementWithResult[] = [];

  result.linear_scales &&
    Object.entries(result.linear_scales).forEach(
      (linearScaleAnswer: [string, MatrixLinearScaleResult]) => {
        statementsWithResults.push({
          statementKey: linearScaleAnswer[0],
          statementMultiloc: linearScaleAnswer[1].question,
          answers: linearScaleAnswer[1].answers,
        });
      }
    );

  return statementsWithResults;
};

// getLinearScaleLabelsArray
// Description: Return a linear scale multilocs array based on result object.
export const getLinearScaleLabelsArray = (result: ResultUngrouped) => {
  const linearScaleLabels: LinearScaleMultilocs[] = [];

  result.multilocs &&
    Object.entries(result.multilocs.answer).forEach((multiloc, index) => {
      linearScaleLabels.push({
        value: index + 1,
        label: multiloc[1].title_multiloc,
      });
    });

  return linearScaleLabels;
};
