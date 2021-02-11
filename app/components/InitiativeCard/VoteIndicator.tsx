import React, { PureComponent } from 'react';
import styled, { withTheme } from 'styled-components';

import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeStatus, {
  GetInitiativeStatusChildProps,
} from 'resources/GetInitiativeStatus';

import { Icon } from 'cl2-component-library';
import ProgressBar from 'components/UI/ProgressBar';

import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import { fontSizes, colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

import T from 'components/T';
import { get } from 'lodash-es';

const Container = styled.div``;

const StatusBadge = styled.div<{ color: string }>`
  font-size: ${fontSizes.small}px;
  line-height: 18px;
  border-radius: ${(props: any) => props.theme.borderRadius};
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
  width: 1.6em;
  height: 1.6em;
  fill: ${colors.clGreenSuccess};
  padding-right: 7px;
`;

const AnsweredStatusBadge = styled(StatusBadge)`
  background-color: ${colors.clGreenSuccessBackground};
  color: ${colors.clGreenSuccess};
`;

const IneligibleBadgeIcon = styled(Icon)`
  width: 1.6em;
  height: 1.6em;
  fill: ${colors.clGreyOnGreyBackground};
  padding-right: 7px;
`;

const IneligibleStatusBadge = styled(StatusBadge)`
  background-color: ${colors.lightGreyishBlue};
  color: ${colors.clGreyOnGreyBackground};
`;

const CustomStatusBadge = styled(StatusBadge)`
  color: ${colors.clGreyOnGreyBackground};
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 9px;
  width: 120px;
`;

const VoteCounter = styled.div`
  display: flex;
  align-items: center;
  padding-bottom: 5px;
`;

const VoteText = styled.div`
  color: ${colors.mediumGrey};
  font-size: ${fontSizes.small}px;

  b {
    font-weight: 600;
    color: ${({ theme }) => theme.colorMain};
  }

  span.division-bar {
    padding: 0 4px;
  }
`;

const VoteIcon = styled(Icon)`
  fill: ${colors.label};
  width: 16px;
  height: 16px;
  margin-top: -4px;
  margin-right: 10px;
`;

const ExpiredText = styled.div`
  display: flex;
  align-items: center;
  font-size: ${fontSizes.small}px;
  text-transform: capitalize;
  padding-bottom: 5px;
  color: ${colors.label};
`;

const ExpiredIcon = styled(Icon)`
  path {
    fill: ${colors.clGreyOnGreyBackground};
  }
  width: 14px;
  height: 14px;
  margin: 0 4px 2px 0;
`;

interface InputProps {
  initiativeId: string;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  initiative: GetInitiativeChildProps;
  initiativeStatus: GetInitiativeStatusChildProps;
}

interface Props extends InputProps, DataProps {}

class VoteIndicator extends PureComponent<Props & { theme: any }> {
  render() {
    const { initiative, initiativeStatus, theme, tenant } = this.props;
    if (isNilOrError(initiative) || isNilOrError(initiativeStatus)) return null;

    const statusCode = initiativeStatus.attributes.code;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit: number = get(
      tenant,
      'attributes.settings.initiatives.voting_threshold',
      1
    );

    return (
      <Container className="e2e-initiative-card-vote-indicator">
        {statusCode === 'proposed' && (
          <div>
            <VoteCounter>
              <VoteIcon name="upvote" ariaHidden />
              <VoteText aria-hidden>
                <b className="e2e-initiative-card-vote-count">{voteCount}</b>
                <span className="division-bar">/</span>
                {voteLimit}
              </VoteText>
            </VoteCounter>
            <StyledProgressBar
              progress={voteCount / voteLimit}
              color="linear-gradient(270deg, #DE7756 -30.07%, #FF672F 100%)"
              bgColor={colors.lightGreyishBlue}
              bgShaded={false}
            />
            <ScreenReaderOnly>
              <FormattedMessage
                {...messages.xVotesOfY}
                values={{ xVotes: voteCount, votingThreshold: voteLimit }}
              />
            </ScreenReaderOnly>
          </div>
        )}

        {statusCode === 'expired' && (
          <div>
            <ExpiredText>
              <ExpiredIcon name="clock" ariaHidden />
              <T value={initiativeStatus.attributes.title_multiloc} />
            </ExpiredText>
            <StyledProgressBar
              progress={voteCount / voteLimit}
              color={colors.label}
              bgColor={colors.lightGreyishBlue}
              bgShaded={true}
            />
          </div>
        )}

        {statusCode === 'threshold_reached' && (
          <div>
            <VoteCounter>
              <VoteIcon name="upvote" ariaHidden />
              <VoteText aria-hidden>
                <b>{voteCount}</b>
                <span className="division-bar">/</span>
                {voteLimit}
              </VoteText>
              <ScreenReaderOnly>
                <FormattedMessage
                  {...messages.xVotesOfY}
                  values={{ xVotes: voteCount, votingThreshold: voteLimit }}
                />
              </ScreenReaderOnly>
            </VoteCounter>
            <StyledProgressBar
              progress={voteCount / voteLimit}
              color={theme.colorMain}
              bgColor={colors.lightGreyishBlue}
              bgShaded={false}
            />
          </div>
        )}

        {statusCode === 'answered' && (
          <AnsweredStatusBadge color={initiativeStatus.attributes.color}>
            <AnsweredBadgeIcon name="round-checkmark" ariaHidden />
            <BadgeLabel>
              <T value={initiativeStatus.attributes.title_multiloc} />
            </BadgeLabel>
          </AnsweredStatusBadge>
        )}

        {statusCode === 'ineligible' && (
          <IneligibleStatusBadge color={initiativeStatus.attributes.color}>
            <IneligibleBadgeIcon name="halt" ariaHidden />
            <BadgeLabel>
              <T value={initiativeStatus.attributes.title_multiloc} />
            </BadgeLabel>
          </IneligibleStatusBadge>
        )}

        {statusCode === 'custom' && (
          <CustomStatusBadge color={initiativeStatus.attributes.color}>
            <BadgeLabel>
              <T value={initiativeStatus.attributes.title_multiloc} />
            </BadgeLabel>
          </CustomStatusBadge>
        )}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
  initiativeStatus: ({ initiative, render }) => (
    <GetInitiativeStatus
      id={get(initiative, 'relationships.initiative_status.data.id')}
    >
      {render}
    </GetInitiativeStatus>
  ),
});

const VoteIndicatorWithHOCs = withTheme(VoteIndicator);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <VoteIndicatorWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
