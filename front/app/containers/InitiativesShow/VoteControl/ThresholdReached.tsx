import React, { PureComponent } from 'react';
// components
import { Icon, IconTooltip } from '@citizenlab/cl2-component-library';
import { IAppConfigurationSettings } from 'services/appConfiguration';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
// services
import { IInitiativeData } from 'services/initiatives';
import { FormattedMessage } from 'utils/cl-intl';
import { fontSizes } from 'utils/styleUtils';
// i18n
import T from 'components/T';
import Button from 'components/UI/Button';
import styled, { withTheme } from 'styled-components';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import messages from './messages';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
`;

const VoteText = styled.div`
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
  userVoted: boolean;
  onVote: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ThresholdReached extends PureComponent<Props & { theme: any }, State> {
  handleOnVote = () => {
    this.props.onVote();
  };

  render() {
    const {
      initiative,
      initiativeSettings: { voting_threshold, threshold_reached_message },
      initiativeStatus,
      userVoted,
    } = this.props;

    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;

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
        <VoteText>
          <FormattedMessage
            {...messages.a11y_xVotesOfRequiredY}
            values={{
              votingThreshold: voteLimit,
              xVotes: (
                <b>
                  <FormattedMessage
                    {...messages.xVotes}
                    values={{ count: voteCount }}
                  />
                </b>
              ),
            }}
          />
        </VoteText>
        {!userVoted && (
          <StyledButton icon="vote-up" onClick={this.handleOnVote}>
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        )}
      </Container>
    );
  }
}

export default withTheme(ThresholdReached);
