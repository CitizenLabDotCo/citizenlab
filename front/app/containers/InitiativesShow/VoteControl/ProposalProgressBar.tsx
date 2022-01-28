import React from 'react';
import styled from 'styled-components';
import ProgressBar from 'components/UI/ProgressBar';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { useTheme } from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

interface Props {
  voteCount: number;
  voteLimit: number;
  barColor?: string;
  bgShaded?: boolean;
}

const ProposalProgressBar = ({
  voteCount,
  voteLimit,
  barColor,
  bgShaded,
}: Props) => {
  const theme: any = useTheme();
  return (
    <>
      <StyledProgressBar
        progress={voteCount / voteLimit}
        color={barColor || theme.colorText}
        bgColor={colors.lightGreyishBlue}
        bgShaded={typeof bgShaded === 'boolean' ? bgShaded : false}
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
    </>
  );
};

export default ProposalProgressBar;
