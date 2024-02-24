import React from 'react';

import styled, { useTheme } from 'styled-components';
import {
  colors,
  fontSizes,
  media,
  Icon,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';
import { StatusExplanation } from '../SharedStyles';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import CountDown from '../CountDown';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import messages from '../messages';
import globalMessages from 'utils/messages';
import T from 'components/T';
import { darken } from 'polished';
import Tippy from '@tippyjs/react';
import { InitiativePermissionsDisabledReason } from 'hooks/useInitiativesPermissions';
import { StatusComponentProps } from '.';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantPrimary};
  }
  width: 31px;
  height: 31px;
  margin-bottom: 10px;
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

const disabledMessages: {
  [key in InitiativePermissionsDisabledReason]: MessageDescriptor;
} = {
  not_permitted: messages.votingNotPermitted,
  not_in_group: globalMessages.notInGroup,
};

const ProposedNotReacted = ({
  onReaction,
  initiative,
  initiativeSettings,
  disabledReason,
  userReacted,
  onCancelReaction,
}: StatusComponentProps) => {
  const theme = useTheme();

  const thresholdReachedTooltip = (
    <IconTooltip
      icon="info-outline"
      iconColor={theme.colors.tenantText}
      theme="light"
      placement="bottom"
      content={
        <T value={initiativeSettings.threshold_reached_message} supportHtml />
      }
    />
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
      <Box ml="auto">
        <CountDown targetTime={initiative.attributes.expires_at} />
      </Box>
      <StatusIcon ariaHidden name="bullseye" />
      <StatusExplanation>
        <OnDesktop>
          <FormattedMessage
            {...messages.proposedStatusExplanation}
            values={{
              votingThreshold: initiativeSettings.reacting_threshold,
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
              daysLeft: getPeriodRemainingUntil(
                initiative.attributes.expires_at
              ),
              votingThreshold: initiativeSettings.reacting_threshold,
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
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
        />
      </Box>
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
          <VoteButtons
            voteButtonId="e2e-initiative-like-button"
            onCancelReaction={onCancelReaction}
            onReaction={onReaction}
            userReacted={userReacted}
          />
        </div>
      </Tippy>
    </Container>
  );
};

export default ProposedNotReacted;
