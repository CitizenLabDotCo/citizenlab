import React from 'react';
import styled, { useTheme } from 'styled-components';
import { fontSizes } from 'utils/styleUtils';
import useLocalize from 'hooks/useLocalize';
import useAppConfiguration from 'hooks/useAppConfiguration';
import { isNilOrError } from 'utils/helperUtils';

// services
import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

// components
import { Icon, IconTooltip } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

// i18n
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

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
}

const ThresholdReached = ({
  initiative,
  initiativeSettings: { voting_threshold, threshold_reached_message },
  initiativeStatus,
  userVoted,
  onVote,
}: Props) => {
  const theme: any = useTheme();
  const localize = useLocalize();
  const appConfig = useAppConfiguration();
  const handleOnVote = () => {
    onVote();
  };

  const voteCount = initiative.attributes.upvotes_count;
  const voteLimit = voting_threshold;

  if (!isNilOrError(appConfig)) {
    const orgName = localize(
      appConfig.attributes.settings.core.organization_name
    );

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon ariaHidden name="envelope-check" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.thresholdReachedStatusExplanation}
            values={{
              orgName,
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
              icon="info"
              iconColor={theme.colorText}
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
          <StyledButton icon="upvote" onClick={handleOnVote}>
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        )}
      </Container>
    );
  }

  return null;
};

export default ThresholdReached;
