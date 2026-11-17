import React from 'react';

import { colors } from '@citizenlab/cl2-component-library';
import styled, { useTheme } from 'styled-components';

import ProgressBar from 'components/UI/ProgressBar';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
  border: ${(props) =>
    props.bgShaded ? 'none' : `1px solid ${props.theme.colors.tenantPrimary}`};
  border-radius: ${(props) => props.theme.borderRadius};
`;

interface Props {
  reactionCount: number;
  reactionLimit: number;
  barColor?: string;
  bgShaded?: boolean;
  className?: string;
}

const ProposalProgressBar = ({
  reactionCount,
  reactionLimit,
  barColor,
  bgShaded = false,
  className,
}: Props) => {
  const theme = useTheme();

  return (
    <div className={className}>
      <StyledProgressBar
        progress={reactionCount / reactionLimit}
        color={barColor || theme.colors.tenantText}
        bgColor={colors.grey200}
        bgShaded={bgShaded}
      />
      <ScreenReaderOnly>
        <FormattedMessage
          {...messages.a11y_xVotesOfRequiredY}
          values={{
            xVotes: (
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: reactionCount }}
              />
            ),
            votingThreshold: reactionLimit,
          }}
        />
      </ScreenReaderOnly>
    </div>
  );
};

export default ProposalProgressBar;
