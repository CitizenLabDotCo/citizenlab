import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import { Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
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

const Buttons = styled.div`
  margin-top: 20px;
  display: flex;
  margin: 20px -3px 0 -3px;
  & > * {
    flex: 1;
    margin: 3px;
  }
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
  onScrollToOfficialFeedback: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class Answered extends PureComponent<Props, State> {
  handleOnReaction = () => {
    this.props.onReaction();
  };

  handleOnReadAnswer = () => {
    this.props.onScrollToOfficialFeedback();
  };

  render() {
    const { initiative, initiativeStatus, userReacted } = this.props;

    const reactionCount = initiative.attributes.likes_count;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon name="email-check" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.answeredStatusExplanation}
            values={{
              answeredStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.answeredStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
        </StatusExplanation>
        <ReactionText>
          <FormattedMessage
            {...messages.xPeopleVoted}
            values={{
              xPeople: (
                <b>
                  <FormattedMessage
                    {...messages.xPeople}
                    values={{ count: reactionCount }}
                  />
                </b>
              ),
            }}
          />
        </ReactionText>
        <Buttons>
          <Button onClick={this.handleOnReadAnswer}>
            <FormattedMessage {...messages.readAnswer} />
          </Button>
          {!userReacted && (
            <Button
              buttonStyle="primary-outlined"
              onClick={this.handleOnReaction}
            >
              <FormattedMessage {...messages.vote} />
            </Button>
          )}
        </Buttons>
      </Container>
    );
  }
}

export default Answered;
