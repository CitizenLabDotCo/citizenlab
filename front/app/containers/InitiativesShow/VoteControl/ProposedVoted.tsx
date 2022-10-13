import React, { PureComponent } from 'react';

import styled, { keyframes } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

import { getDaysRemainingUntil } from 'utils/dateUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import { Icon } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import ProposalProgressbar from './ProposalProgressBar';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

const StyledIcon = styled(Icon)`
  fill: ${colors.success};
  width: 63px;
  height: 63px;
  animation: ${scaleIn} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
`;

const VotedTitle = styled.h4`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  margin-top: 25px;
  margin-bottom: 5px;
  width: 100%;
`;

const VotedText = styled.p`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 21px;
  text-align: center;
  margin: 0 0 20px 0;
  width: 100%;
`;

const UnvoteButton = styled.button`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  text-decoration: underline;

  &:hover {
    color: ${(props) => darken(0.12, props.theme.colors.tenantText)};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const VoteCounter = styled.div`
  margin-top: 15px;
  width: 100%;
  ${media.tablet`
    display: none;
  `}
`;

const VoteText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const VoteTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onCancelVote: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

class ProposedVoted extends PureComponent<Props & { theme: any }> {
  handleOnCancelVote = () => {
    this.props.onCancelVote();
  };

  render() {
    const {
      initiative,
      initiativeSettings: { voting_threshold },
    } = this.props;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;
    const daysLeft = getDaysRemainingUntil(initiative.attributes.expires_at);

    return (
      <Container>
        <StyledIcon ariaHidden name="check-circle" />
        <VotedTitle>
          <FormattedMessage {...messages.votedTitle} />
        </VotedTitle>
        <VotedText>
          <FormattedMessage
            {...messages.votedText}
            values={{
              x: daysLeft,
              xDays: (
                <b>
                  <FormattedMessage
                    {...messages.xDays}
                    values={{ x: daysLeft }}
                  />
                </b>
              ),
            }}
          />
        </VotedText>
        <UnvoteButton
          id="e2e-initiative-cancel-upvote-button"
          onClick={this.handleOnCancelVote}
        >
          <FormattedMessage {...messages.unvoteLink} />
        </UnvoteButton>
        <VoteCounter>
          <VoteText aria-hidden={true}>
            <VoteTextLeft id="e2e-initiative-voted-vote-count">
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: voteCount }}
              />
            </VoteTextLeft>
            <VoteTextRight>{voteLimit}</VoteTextRight>
          </VoteText>
          <ProposalProgressbar voteCount={voteCount} voteLimit={voteLimit} />
        </VoteCounter>
      </Container>
    );
  }
}

export default ProposedVoted;
