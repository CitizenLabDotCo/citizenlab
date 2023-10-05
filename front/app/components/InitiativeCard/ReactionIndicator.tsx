import React from 'react';
import styled, { useTheme } from 'styled-components';

import { Icon } from '@citizenlab/cl2-component-library';
import ProposalProgressBar from 'containers/InitiativesShow/ReactionControl/ProposalProgressBar';

import { isNilOrError } from 'utils/helperUtils';

import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import T from 'components/T';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';

const Container = styled.div``;

const StatusBadge = styled.div<{ color: string }>`
  font-size: ${fontSizes.s}px;
  line-height: 18px;
  border-radius: ${(props) => props.theme.borderRadius};
  padding: 8px 12px;
  font-weight: 400;
  background-color: ${(props) => props.color};
  display: flex;
  align-items: center;
`;

const BadgeLabel = styled.div`
  &:first-letter {
    text-transform: uppercase;
  }
`;

const AnsweredBadgeIcon = styled(Icon)`
  fill: ${colors.success};
  padding-right: 7px;
`;

const AnsweredStatusBadge = styled(StatusBadge)`
  background-color: ${colors.successLight};
  color: ${colors.success};
`;

const IneligibleBadgeIcon = styled(Icon)`
  fill: ${colors.coolGrey600};
  padding-right: 7px;
`;

const IneligibleStatusBadge = styled(StatusBadge)`
  background-color: ${colors.grey200};
  color: ${colors.coolGrey600};
`;

const StyledProposalProgressBar = styled(ProposalProgressBar)`
  height: 9px;
  width: 120px;
`;

const ReactionCounter = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const ReactionText = styled.div`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;

  b {
    font-weight: 600;
    color: ${({ theme }) => theme.colors.tenantPrimary};
  }

  span.division-bar {
    padding: 0 4px;
  }
`;

const ReactionIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  margin-top: -4px;
  margin-right: 10px;
`;

const ExpiredText = styled.div`
  display: flex;
  align-items: center;
  font-size: ${fontSizes.s}px;
  text-transform: capitalize;
  padding-bottom: 5px;
  color: ${colors.textSecondary};
`;

const ExpiredIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  margin: 0 4px 2px 0;
`;

interface Props {
  initiativeId: string;
}

const ReactionIndicator = ({ initiativeId }: Props) => {
  const theme = useTheme();
  const { data: appConfiguration } = useAppConfiguration();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeStatus } = useInitiativeStatus(
    initiative?.data.relationships.initiative_status?.data?.id
  );
  if (isNilOrError(initiativeStatus)) return null;

  const statusCode = initiativeStatus.data.attributes.code;
  const reactionCount = initiative?.data.attributes.likes_count || 0;
  const reactionLimit: number =
    appConfiguration?.data.attributes.settings.initiatives.reacting_threshold ||
    1;

  return (
    <Container className="e2e-initiative-card-reaction-indicator">
      {statusCode === 'proposed' && (
        <div>
          <ReactionCounter>
            <ReactionIcon name="vote-up" ariaHidden />
            <ReactionText aria-hidden>
              <b className="e2e-initiative-card-reaction-count">
                {reactionCount}
              </b>
              <span className="division-bar">/</span>
              {reactionLimit}
            </ReactionText>
          </ReactionCounter>
          <StyledProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor="linear-gradient(270deg, #DE7756 -30.07%, #FF672F 100%)"
          />
          <ScreenReaderOnly>
            <FormattedMessage
              {...messages.xVotesOfY}
              values={{
                xVotes: reactionCount,
                votingThreshold: reactionLimit,
              }}
            />
          </ScreenReaderOnly>
        </div>
      )}

      {statusCode === 'expired' && (
        <div>
          <ExpiredText>
            <ExpiredIcon name="clock" ariaHidden />
            <T value={initiativeStatus.data.attributes.title_multiloc} />
          </ExpiredText>

          <StyledProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor={colors.textSecondary}
            bgShaded
          />
        </div>
      )}

      {statusCode === 'threshold_reached' && (
        <div>
          <ReactionCounter>
            <ReactionIcon name="vote-up" ariaHidden />
            <ReactionText aria-hidden>
              <b>{reactionCount}</b>
              <span className="division-bar">/</span>
              {reactionLimit}
            </ReactionText>
          </ReactionCounter>

          <StyledProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor={theme.colors.tenantPrimary}
          />
        </div>
      )}

      {statusCode === 'answered' && (
        <AnsweredStatusBadge color={initiativeStatus.data.attributes.color}>
          <AnsweredBadgeIcon name="check-circle" ariaHidden />
          <BadgeLabel>
            <T value={initiativeStatus.data.attributes.title_multiloc} />
          </BadgeLabel>
        </AnsweredStatusBadge>
      )}

      {statusCode === 'ineligible' && (
        <IneligibleStatusBadge color={initiativeStatus.data.attributes.color}>
          <IneligibleBadgeIcon name="halt" ariaHidden />
          <BadgeLabel>
            <T value={initiativeStatus.data.attributes.title_multiloc} />
          </BadgeLabel>
        </IneligibleStatusBadge>
      )}
    </Container>
  );
};

export default ReactionIndicator;
