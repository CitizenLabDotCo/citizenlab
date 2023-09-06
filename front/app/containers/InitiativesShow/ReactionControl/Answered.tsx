import React from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { IInitiativeData } from 'api/initiatives/types';

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
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

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
  onScrollToOfficialFeedback: () => void;
}

const Answered = (props: Props) => {
  const handleOnReaction = () => {
    props.onReaction();
  };

  const handleOnReadAnswer = () => {
    props.onScrollToOfficialFeedback();
  };

  const { initiative, initiativeStatus, userReacted } = props;

  const reactionCount = initiative.attributes.likes_count;

  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon name="email-check" />
      <StatusExplanation>
        <FormattedMessage
          {...messages.answeredStatusExplanation}
          values={{
            answeredStatusExplanationBold: (
              <b>
                <FormattedMessage {...messages.answeredStatusExplanationBold} />
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
        <Button onClick={handleOnReadAnswer}>
          <FormattedMessage {...messages.readAnswer} />
        </Button>
        {!userReacted && (
          <Button buttonStyle="primary-outlined" onClick={handleOnReaction}>
            <FormattedMessage {...messages.vote} />
          </Button>
        )}
      </Buttons>
    </Box>
  );
};

export default Answered;
