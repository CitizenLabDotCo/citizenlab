import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/tenant';

import { Icon } from 'cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colorText};
  }
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
`;

const VoteText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colorText};
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
  userVoted: boolean;
  onVote: () => void;
  onScrollToOfficialFeedback: () => void;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class Answered extends PureComponent<Props, State> {
  handleOnVote = () => {
    this.props.onVote();
  };

  handleOnReadAnswer = () => {
    this.props.onScrollToOfficialFeedback();
  };

  render() {
    const { initiative, initiativeStatus, userVoted } = this.props;

    const voteCount = initiative.attributes.upvotes_count;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon name="envelope-check" />
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
        <VoteText>
          <FormattedMessage
            {...messages.xPeopleVoted}
            values={{
              xPeople: (
                <b>
                  <FormattedMessage
                    {...messages.xPeople}
                    values={{ count: voteCount }}
                  />
                </b>
              ),
            }}
          />
        </VoteText>
        <Buttons>
          <Button onClick={this.handleOnReadAnswer}>
            <FormattedMessage {...messages.readAnswer} />
          </Button>
          {!userVoted && (
            <Button buttonStyle="primary-outlined" onClick={this.handleOnVote}>
              <FormattedMessage {...messages.vote} />
            </Button>
          )}
        </Buttons>
      </Container>
    );
  }
}

export default Answered;
