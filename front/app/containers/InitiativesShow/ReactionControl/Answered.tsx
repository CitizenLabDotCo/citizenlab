import React from 'react';
import styled from 'styled-components';
import { Box, Icon, Text } from '@citizenlab/cl2-component-library';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

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

const Buttons = styled.div`
  display: flex;

  & > * {
    flex: 1;
  }
`;

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
  onCancelReaction: () => void;
  onScrollToOfficialFeedback: () => void;
}

const Answered = ({
  onReaction,
  onCancelReaction,
  onScrollToOfficialFeedback,
  initiative,
  initiativeStatus,
  userReacted,
}: Props) => {
  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon name="email-check" />
      <Box mb="12px">
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
      </Box>
      <Buttons>
        <Box mr="8px">
          {userReacted ? (
            <Button buttonStyle="primary-outlined" onClick={onCancelReaction}>
              <FormattedMessage {...messages.cancelVote} />
            </Button>
          ) : (
            <Button buttonStyle="primary" onClick={onReaction}>
              <FormattedMessage {...messages.vote} />
            </Button>
          )}
        </Box>
        <Button buttonStyle="secondary" onClick={onScrollToOfficialFeedback}>
          <FormattedMessage {...messages.readAnswer} />
        </Button>
      </Buttons>
      <Text fontSize="base" mb="8px">
        <FormattedMessage
          {...messages.xPeopleVoted}
          values={{
            xPeople: (
              <b>
                <FormattedMessage
                  {...messages.xPeople}
                  values={{ count: initiative.attributes.likes_count }}
                />
              </b>
            ),
          }}
        />
      </Text>
    </Box>
  );
};

export default Answered;
