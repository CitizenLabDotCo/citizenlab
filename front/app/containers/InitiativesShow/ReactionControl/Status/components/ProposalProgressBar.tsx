import React from 'react';

import { colors, Box } from '@citizenlab/cl2-component-library';
import { useTheme } from 'styled-components';

import ProgressBar from 'components/UI/ProgressBar';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

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
      <Box
        height="12px"
        width="100%"
        border={`1px solid ${colors.primary}`}
        borderRadius="4px"
      >
        <ProgressBar
          progress={reactionCount / reactionLimit}
          color={barColor || theme.colors.tenantText}
          bgColor={colors.grey200}
          bgShaded={bgShaded}
        />
      </Box>
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
