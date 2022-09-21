import React from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import { isNilOrError } from 'utils/helperUtils';
import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import { Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';

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

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
  onScrollToOfficialFeedback: () => void;
}

const Answered = ({
  onVote,
  onScrollToOfficialFeedback,
  initiative,
  initiativeStatus,
  userVoted,
}: Props) => {
  const localize = useLocalize();
  const appConfig = useAppConfiguration();
  const handleOnVote = () => {
    onVote();
  };
  const handleOnReadAnswer = () => {
    onScrollToOfficialFeedback();
  };

  const voteCount = initiative.attributes.upvotes_count;

  if (!isNilOrError(appConfig)) {
    const orgName = localize(
      appConfig.attributes.settings.core.organization_name
    );

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
                    values={{ orgName }}
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
          <Button onClick={handleOnReadAnswer}>
            <FormattedMessage {...messages.readAnswer} />
          </Button>
          {!userVoted && (
            <Button buttonStyle="primary-outlined" onClick={handleOnVote}>
              <FormattedMessage {...messages.vote} />
            </Button>
          )}
        </Buttons>
      </Container>
    );
  }

  return null;
};

export default Answered;
