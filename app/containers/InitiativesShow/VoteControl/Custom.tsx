import React, { PureComponent } from 'react';

import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { StatusExplanation } from './SharedStyles';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/tenant';

import CountDown from './CountDown';
import ProgressBar from 'components/UI/ProgressBar';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const VoteCounter = styled.div`
  margin-top: 15px;
`;

const VoteText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colorMain};
`;

const VoteTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colorText};
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

class Custom extends PureComponent<Props & { theme: any }> {
  handleOnVote = () => {
    this.props.onVote();
  };

  render() {
    const {
      initiative,
      initiativeStatus,
      initiativeSettings: { voting_threshold },
      theme,
      userVoted,
    } = this.props;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;

    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={initiative.attributes.expires_at} />
        </CountDownWrapper>
        <StatusExplanation>
          <T value={initiativeStatus.attributes.description_multiloc} />
        </StatusExplanation>
        <VoteCounter>
          <VoteText aria-hidden={true}>
            <VoteTextLeft>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: voteCount }}
              />
            </VoteTextLeft>
            <VoteTextRight>{voteLimit}</VoteTextRight>
          </VoteText>
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.xVotesOfY}
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
          <StyledProgressBar
            progress={voteCount / voteLimit}
            color={theme.colorMain}
            bgColor={colors.lightGreyishBlue}
          />
        </VoteCounter>
        {!userVoted && (
          <StyledButton
            icon="upvote"
            buttonStyle="primary"
            onClick={this.handleOnVote}
          >
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        )}
      </Container>
    );
  }
}

export default withTheme(Custom);
