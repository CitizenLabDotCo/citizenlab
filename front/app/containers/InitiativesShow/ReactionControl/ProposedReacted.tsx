import React from 'react';

import styled, { keyframes } from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';
import { darken } from 'polished';

import { getPeriodRemainingUntil } from 'utils/dateUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import { Icon } from '@citizenlab/cl2-component-library';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import ProposalProgressbar from './ProposalProgressBar';
import { IInitiativeData } from 'api/initiatives/types';

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

const ReactedTitle = styled.h4`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 600;
  text-align: center;
  margin: 0;
  margin-top: 25px;
  margin-bottom: 5px;
  width: 100%;
`;

const ReactedText = styled.p`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  line-height: 21px;
  text-align: center;
  margin: 0 0 20px 0;
  width: 100%;
`;

const UnreactButton = styled.button`
  color: ${(props) => props.theme.colors.tenantText};
  font-size: ${fontSizes.base}px;
  text-decoration: underline;

  &:hover {
    color: ${(props) => darken(0.12, props.theme.colors.tenantText)};
    text-decoration: underline;
    cursor: pointer;
  }
`;

const ReactionCounter = styled.div`
  margin-top: 15px;
  width: 100%;
  ${media.tablet`
    display: none;
  `}
`;

const ReactionText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const ReactionTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onCancelReaction: () => void;
}

const ProposedReacted = (props: Props) => {
  const handleOnCancelReaction = () => {
    props.onCancelReaction();
  };

  const {
    initiative,
    initiativeSettings: { reacting_threshold },
  } = props;
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;
  const daysLeft = getPeriodRemainingUntil(initiative.attributes.expires_at);

  return (
    <Container>
      <StyledIcon ariaHidden name="check-circle" />
      <ReactedTitle>
        <FormattedMessage {...messages.votedTitle} />
      </ReactedTitle>
      <ReactedText>
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
      </ReactedText>
      <UnreactButton
        id="e2e-initiative-cancel-like-button"
        onClick={handleOnCancelReaction}
      >
        <FormattedMessage {...messages.unvoteLink} />
      </UnreactButton>
      <ReactionCounter>
        <ReactionText aria-hidden={true}>
          <ReactionTextLeft id="e2e-initiative-reacted-reaction-count">
            <FormattedMessage
              {...messages.xVotes}
              values={{ count: reactionCount }}
            />
          </ReactionTextLeft>
          <ReactionTextRight>{reactionLimit}</ReactionTextRight>
        </ReactionText>
        <ProposalProgressbar
          reactionCount={reactionCount}
          reactionLimit={reactionLimit}
        />
      </ReactionCounter>
    </Container>
  );
};

export default ProposedReacted;
