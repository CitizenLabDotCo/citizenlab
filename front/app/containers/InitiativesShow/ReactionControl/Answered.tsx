import React from 'react';
import styled from 'styled-components';
import {
  Box,
  Icon,
  colors,
  fontSizes,
  media,
} from '@citizenlab/cl2-component-library';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { IInitiativeData } from 'api/initiatives/types';
import ProposalProgressBar from './ProposalProgressBar';

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const ReactionCounter = styled.div`
  margin-top: 15px;
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
  color: ${(props) => props.theme.colors.tenantPrimary};
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
  initiativeSettings: { reacting_threshold },
  userReacted,
}: Props) => {
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon name="email-check" />
      <Box mb="24px">
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
      <Box mb="24px">
        <ReactionCounter>
          <ReactionText aria-hidden={true}>
            <ReactionTextLeft>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: reactionCount }}
              />
            </ReactionTextLeft>
            <ReactionTextRight>{reactionLimit}</ReactionTextRight>
          </ReactionText>
          <ProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor={colors.green500}
          />
        </ReactionCounter>
      </Box>
      <Box mb="8px">
        {userReacted ? (
          <Button
            buttonStyle="success"
            iconSize="20px"
            icon="check"
            onClick={onCancelReaction}
          >
            <FormattedMessage {...messages.voted} />
          </Button>
        ) : (
          <Button
            buttonStyle="primary"
            iconSize="20px"
            icon="vote-ballot"
            onClick={onReaction}
          >
            <FormattedMessage {...messages.vote} />
          </Button>
        )}
      </Box>
      <Button
        icon="survey-long-answer-2"
        iconSize="20px"
        buttonStyle="secondary"
        onClick={onScrollToOfficialFeedback}
      >
        <FormattedMessage {...messages.readAnswer} />
      </Button>
    </Box>
  );
};

export default Answered;
