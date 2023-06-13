import React, { PureComponent } from 'react';
import styled, { withTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// services
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

// components
import { Icon, IconTooltip } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

// i18n
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// Types
import { IInitiativeData } from 'api/initiatives/types';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
`;

const ReactionText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
  margin-top: 20px;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ThresholdReached extends PureComponent<Props & { theme: any }, State> {
  handleOnReaction = () => {
    this.props.onReaction();
  };

  render() {
    const {
      initiative,
      initiativeSettings: { reacting_threshold, threshold_reached_message },
      initiativeStatus,
      userReacted,
    } = this.props;

    const reactionCount = initiative.attributes.likes_count;
    const reactionLimit = reacting_threshold;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon ariaHidden name="email-check" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.thresholdReachedStatusExplanation}
            values={{
              thresholdReachedStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.thresholdReachedStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
          {threshold_reached_message ? (
            <IconTooltip
              icon="info-outline"
              iconColor={this.props.theme.colors.tenantText}
              theme="light"
              placement="bottom"
              content={<T value={threshold_reached_message} supportHtml />}
            />
          ) : (
            <></>
          )}
        </StatusExplanation>
        <ReactionText>
          <FormattedMessage
            {...messages.a11y_xVotesOfRequiredY}
            values={{
              votingThreshold: reactionLimit,
              xReactions: (
                <b>
                  <FormattedMessage
                    {...messages.xVotes}
                    values={{ count: reactionCount }}
                  />
                </b>
              ),
            }}
          />
        </ReactionText>
        {!userReacted && (
          <StyledButton icon="vote-up" onClick={this.handleOnReaction}>
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        )}
      </Container>
    );
  }
}

export default withTheme(ThresholdReached);
