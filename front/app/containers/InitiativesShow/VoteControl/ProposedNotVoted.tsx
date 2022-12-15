import React from 'react';

import styled, { useTheme } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { StatusExplanation } from './SharedStyles';
import { getDaysRemainingUntil } from 'utils/dateUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import CountDown from './CountDown';
import { Icon, IconTooltip } from '@citizenlab/cl2-component-library';

import Button from 'components/UI/Button';
import ProposalProgressBar from './ProposalProgressBar';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';
import { IInitiativeDisabledReason } from 'hooks/useInitiativesPermissions';
import { darken } from 'polished';
import Tippy from '@tippyjs/react';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
  ${media.tablet`
    display: none;
  `}
`;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantPrimary};
  }
  width: 31px;
  height: 31px;
  margin-bottom: 10px;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
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
  color: ${(props) => props.theme.colors.tenantPrimary};
`;

const VoteTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

const StyledButton = styled(Button)`
  margin-top: 20px;

  svg {
    margin-top: -2px;
  }
`;

const OnDesktop = styled.span`
  display: inline;

  ${media.tablet`
    display: none;
  `}
`;

const OnMobile = styled.span`
  display: inline;

  ${media.desktop`
    display: none;
  `}
`;

const TooltipContent = styled.div<{ inMap?: boolean }>`
  display: flex;
  align-items: center;
  padding: ${(props) => (props.inMap ? '0px' : '15px')};
`;

const TooltipContentIcon = styled(Icon)`
  flex: 0 0 24px;
  margin-right: 1rem;
`;

const TooltipContentText = styled.div`
  flex: 1 1 auto;
  color: ${colors.textPrimary};
  font-size: ${fontSizes.base}px;
  line-height: normal;
  font-weight: 400;
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;

  a,
  button {
    color: ${colors.teal};
    font-size: ${fontSizes.base}px;
    line-height: normal;
    font-weight: 400;
    text-align: left;
    text-decoration: underline;
    white-space: normal;
    overflow-wrap: break-word;
    word-wrap: break-word;
    word-break: break-all;
    word-break: break-word;
    hyphens: auto;
    display: inline;
    padding: 0px;
    margin: 0px;
    cursor: pointer;
    transition: all 100ms ease-out;

    &:hover {
      color: ${darken(0.15, colors.teal)};
      text-decoration: underline;
    }
  }
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
  disabledReason: IInitiativeDisabledReason;
}

interface Props extends InputProps {}

const disabledMessages: {
  [key in IInitiativeDisabledReason]: MessageDescriptor;
} = {
  notPermitted: messages.votingNotPermitted,
};

const ProposedNotVoted = ({
  onVote,
  initiative,
  initiativeSettings: { voting_threshold, threshold_reached_message },
  disabledReason,
}: Props) => {
  const theme = useTheme();
  const voteCount = initiative.attributes.upvotes_count;
  const voteLimit = voting_threshold;
  const daysLeft = getDaysRemainingUntil(initiative.attributes.expires_at);

  const thresholdReachedTooltip = threshold_reached_message ? (
    <IconTooltip
      icon="info-outline"
      iconColor={theme.colors.tenantText}
      theme="light"
      placement="bottom"
      content={<T value={threshold_reached_message} supportHtml />}
    />
  ) : (
    <></>
  );

  const tippyContent = disabledReason ? (
    <TooltipContent id="tooltip-content" className="e2e-disabled-tooltip">
      <TooltipContentIcon name="lock" ariaHidden />
      <TooltipContentText>
        <FormattedMessage {...disabledMessages[disabledReason]} />
      </TooltipContentText>
    </TooltipContent>
  ) : null;

  return (
    <Container>
      <CountDownWrapper>
        <CountDown targetTime={initiative.attributes.expires_at} />
      </CountDownWrapper>
      <StatusIcon ariaHidden name="bullseye" />
      <StatusExplanation>
        <OnDesktop>
          <FormattedMessage
            {...messages.proposedStatusExplanation}
            values={{
              votingThreshold: voting_threshold,
              proposedStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.proposedStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
          {thresholdReachedTooltip}
        </OnDesktop>
        <OnMobile>
          <FormattedMessage
            {...messages.proposedStatusExplanationMobile}
            values={{
              daysLeft,
              votingThreshold: voting_threshold,
              proposedStatusExplanationMobileBold: (
                <b>
                  <FormattedMessage
                    {...messages.proposedStatusExplanationMobileBold}
                  />
                </b>
              ),
            }}
          />
          {thresholdReachedTooltip}
        </OnMobile>
      </StatusExplanation>
      <VoteCounter>
        <VoteText aria-hidden={true}>
          <VoteTextLeft id="e2e-initiative-not-voted-vote-count">
            <FormattedMessage
              {...messages.xVotes}
              values={{ count: voteCount }}
            />
          </VoteTextLeft>
          <VoteTextRight>{voteLimit}</VoteTextRight>
        </VoteText>
        <ProposalProgressBar voteCount={voteCount} voteLimit={voteLimit} />
      </VoteCounter>
      <Tippy
        disabled={!tippyContent}
        placement="bottom"
        content={tippyContent || <></>}
        theme="light"
        hideOnClick={false}
      >
        <div
          tabIndex={tippyContent ? 0 : -1}
          className={`${tippyContent ? 'disabled' : ''} ${
            disabledReason ? disabledReason : ''
          }`}
        >
          <StyledButton
            icon="vote-up"
            aria-describedby="tooltip-content"
            disabled={!!tippyContent}
            buttonStyle="primary"
            onClick={onVote}
            id="e2e-initiative-upvote-button"
            ariaDisabled={false}
          >
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        </div>
      </Tippy>
    </Container>
  );
};

export default ProposedNotVoted;
