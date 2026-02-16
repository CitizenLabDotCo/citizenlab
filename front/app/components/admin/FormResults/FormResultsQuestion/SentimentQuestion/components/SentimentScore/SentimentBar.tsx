import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { getSentimentGroupColour } from '../../utils';

import { AnswerGroups } from './types';

// Ensure background colors print correctly
const StyledBox = styled(Box)`
  @media print {
    * {
      -webkit-print-color-adjust: exact;
    }
  }
`;

type Props = {
  answerGroups?: AnswerGroups;
};

const SentimentBar = ({ answerGroups }: Props) => {
  const hasValidAnswers = answerGroups?.some(
    ({ percentage }) => percentage > 0
  );

  if (!hasValidAnswers) {
    return (
      <StyledBox
        display="flex"
        alignItems="center"
        width="160px"
        height="8px"
        borderRadius={stylingConsts.borderRadius}
        background={colors.grey300}
      />
    );
  }

  return (
    <StyledBox display="flex" alignItems="center" width="160px" gap="2px">
      {answerGroups!
        .filter(({ percentage }) => percentage > 0)
        .map(({ answer, percentage }) => (
          <StyledBox
            key={answer}
            background={getSentimentGroupColour(answer)}
            width={`${percentage}%`}
            height="8px"
            borderRadius={stylingConsts.borderRadius}
          />
        ))}
    </StyledBox>
  );
};

export default SentimentBar;
