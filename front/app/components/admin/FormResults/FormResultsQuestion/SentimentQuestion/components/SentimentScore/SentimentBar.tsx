import React from 'react';

import { Box, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { getSentimentGroupColour } from '../../utils';

import { AnswerGroups } from './types';

// Required so the report print will show background colours correctly.
const StyledBox = styled(Box)`
  @media print {
    * {
      -webkit-print-color-adjust: exact;
    }
  }
`;

const SentimentBar = ({ answerGroups }: { answerGroups?: AnswerGroups }) => {
  const answerGroupsWithPercentages = answerGroups?.filter(
    ({ percentage }) => percentage > 0
  );

  return (
    <StyledBox display="flex" alignItems="center" width="160px" gap="2px">
      {answerGroupsWithPercentages ? (
        answerGroupsWithPercentages.map(({ answer, percentage }) => (
          <StyledBox
            key={answer}
            background={getSentimentGroupColour(answer)}
            width={`${percentage}%`}
            height="8px"
            borderRadius={stylingConsts.borderRadius}
          />
        ))
      ) : (
        // If no answers, show a solid grey bar.
        <StyledBox
          background={colors.grey300}
          width={`100%`}
          height="8px"
          borderRadius={stylingConsts.borderRadius}
        />
      )}
    </StyledBox>
  );
};

export default SentimentBar;
