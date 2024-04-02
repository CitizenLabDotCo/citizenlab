import React from 'react';

import { Box, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import { StatusComponentProps } from '../../StatusWrapper';

import ProposalProgressBar from './ProposalProgressBar';

const ReactionText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

const ReactionTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

interface Props {
  id?: string;
  initiative: StatusComponentProps['initiative'];
  initiativeSettings: StatusComponentProps['initiativeSettings'];
  barColor?: string;
}

const ReactionCounter = ({
  id,
  initiative,
  initiativeSettings: { reacting_threshold },
  barColor,
}: Props) => {
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

  return (
    <Box id={id}>
      <ReactionText aria-hidden={true}>
        <ReactionTextLeft id="e2e-initiative-reaction-count">
          <FormattedMessage
            {...messages.xVotes}
            values={{ count: reactionCount }}
          />
        </ReactionTextLeft>
        <ReactionTextRight>{reactionLimit}</ReactionTextRight>
      </ReactionText>
      <ProposalProgressBar
        reactionCount={reactionCount}
        reactionLimit={reactionLimit}
        barColor={barColor}
      />
    </Box>
  );
};

export default ReactionCounter;
