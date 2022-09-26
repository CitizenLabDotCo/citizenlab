import ProgressBar from 'components/UI/ProgressBar';
import React from 'react';
import { FormattedMessage } from 'react-intl';
import styled, { useTheme } from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';
import { colors } from 'utils/styleUtils';
import messages from './messages';

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

interface Props {
  voteCount: number;
  voteLimit: number;
  barColor?: string;
  bgShaded?: boolean;
  className?: string;
}

const ProposalProgressBar = ({
  voteCount,
  voteLimit,
  barColor,
  bgShaded = false,
  className,
}: Props) => {
  const theme: any = useTheme();
  return (
    <div className={className}>
      <StyledProgressBar
        progress={voteCount / voteLimit}
        color={barColor || theme.colorText}
        bgColor={colors.lightGreyishBlue}
        bgShaded={bgShaded}
      />
      <ScreenReaderOnly>
        <FormattedMessage
          {...messages.a11y_xVotesOfRequiredY}
          values={{
            xVotes: (
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: voteCount }}
              />
            ),
            votingThreshold: voteLimit,
          }}
        />
      </ScreenReaderOnly>
    </div>
  );
};

export default ProposalProgressBar;
