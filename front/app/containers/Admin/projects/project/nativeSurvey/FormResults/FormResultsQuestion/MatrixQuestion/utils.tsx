import { colors } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { Multiloc } from 'typings';

import {
  MatrixLinearScaleAnswer,
  MatrixLinearScaleResult,
  ResultUngrouped,
} from 'api/survey_results/types';

import { hexToRGBA } from 'utils/helperUtils';

// STYLED COMPONENTS
export const StickyTd = styled.td`
  max-width: 180px;
  position: sticky;
  inset-inline-start: 0px;
  z-index: 1;
  flex-grow: 1;
`;

export const StledTh = styled.th`
  width: 84px;
  min-width: 84px;

  p {
    word-break: break-word;
  }
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

// getColourByPercentage
// Description: Return tenantPrimary colour and alpha based on a percentage
export const getColourByPercentage = (
  percentage: number,
  tenantPrimary: string
) => {
  // Return tenantPrimary colour and alpha based on the percentage
  return hexToRGBA(tenantPrimary, percentage / 100);
};

// getPercentageTextBorder
// Description: Return text border style based on a percentage
export const getPercentageTextBorder = (percentage: number) => {
  const textBorderColor =
    percentage && percentage >= 75 ? colors.textPrimary : 'white';

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

  Object.entries(result.linear_scales || {}).forEach(
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
