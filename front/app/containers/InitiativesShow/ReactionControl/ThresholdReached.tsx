import React from 'react';
import styled, { useTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

// services
import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

// components
import { Box, Icon, IconTooltip } from '@citizenlab/cl2-component-library';
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
  width: 30px;
  height: 30px;
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

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
  onReaction: () => void;
}

const ThresholdReached = (props: Props) => {
  const theme = useTheme();
  const {
    initiative,
    initiativeSettings: { reacting_threshold, threshold_reached_message },
    initiativeStatus,
    userReacted,
  } = props;
  const handleOnReaction = () => {
    props.onReaction();
  };

  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

  return (
    <Container>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
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
            iconColor={theme.colors.tenantText}
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
            xVotes: (
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
        <StyledButton icon="vote-up" onClick={handleOnReaction}>
          <FormattedMessage {...messages.vote} />
        </StyledButton>
      )}
    </Container>
  );
};

export default ThresholdReached;
