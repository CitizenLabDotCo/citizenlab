import React, { PureComponent } from 'react';

import styled, { withTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { StatusExplanation, TooltipWrapper, HelpIcon } from './SharedStyles';
import { getDaysRemainingUntil } from 'utils/dateUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import CountDown from './CountDown';
import Icon from 'components/UI/Icon';
import Tooltip from 'components/UI/Tooltip';
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

const StatusIcon = styled(Icon)`
  path {
    fill: ${props => props.theme.colorMain};
  }
  width: 31px;
  height: 31px;
  margin-bottom: 10px;
`;

const StyledTooltip = styled(Tooltip)`
  display: inline;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
  ${media.smallerThanMaxTablet`
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
  color: ${props => props.theme.colorMain};
`;

const VoteTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${props => props.theme.colorText};
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

const OnDesktop = styled.div`
  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const OnMobile = styled.div`
  ${media.biggerThanMaxTablet`
    display: none;
  `}
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<ITenantSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
}

interface Props extends InputProps {}

class ProposedNotVoted extends PureComponent<Props & { theme: any }> {

  handleOnVote = () => {
    this.props.onVote();
  }

  render() {
    const { initiative, initiativeSettings: { voting_threshold, threshold_reached_message }, theme } = this.props;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;
    const daysLeft = getDaysRemainingUntil(initiative.attributes.expires_at);

    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={initiative.attributes.expires_at} />
        </CountDownWrapper>
        <StatusIcon name="bullseye" />
        <StatusExplanation>
          <OnDesktop>
            <FormattedMessage
              {...messages.proposedStatusExplanation}
              values={{
                votingThreshold: voting_threshold,
                proposedStatusExplanationBold: (
                  <b>
                    <FormattedMessage {...messages.proposedStatusExplanationBold} />
                  </b>
                )
              }}
            />
          </OnDesktop>
          <OnMobile>
            <FormattedMessage
              {...messages.proposedStatusExplanationMobile}
              values={{
                daysLeft,
                votingThreshold: voting_threshold,
                proposedStatusExplanationMobileBold: (
                  <b>
                    <FormattedMessage {...messages.proposedStatusExplanationMobileBold} />
                  </b>
                )
              }}
            />
          </OnMobile>
          {threshold_reached_message &&
            <StyledTooltip
              content={
                <TooltipWrapper>
                  <T value={threshold_reached_message} supportHtml />
                </TooltipWrapper>
              }
              top="20"
            >
              <HelpIcon name="info" />
            </StyledTooltip>
          }
        </StatusExplanation>
        <VoteCounter>
          <VoteText>
            <VoteTextLeft>
              <FormattedMessage {...messages.xVotes} values={{ count: voteCount }} />
            </VoteTextLeft>
            <VoteTextRight>
              {voteLimit}
            </VoteTextRight>
          </VoteText>
          <StyledProgressBar
            progress={voteCount / voteLimit}
            color={theme.colorMain}
            bgColor={colors.lightGreyishBlue}
          />
        </VoteCounter>
        <StyledButton
          icon="upvote"
          style="primary"
          onClick={this.handleOnVote}
          id="e2e-initiative-upvote-button"
        >
          <FormattedMessage {...messages.vote} />
        </StyledButton>
      </Container>
    );
  }
}

export default withTheme(ProposedNotVoted);
