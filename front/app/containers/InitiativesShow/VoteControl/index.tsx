import React from 'react';
import styled from 'styled-components';
import { isNilOrError } from 'utils/helperUtils';
import { media, defaultCardStyle } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import moment from 'moment';
import messages from './messages';
import {
  InitiativeStatusCode,
  IInitiativeStatusData,
} from 'services/initiativeStatuses';

import { IAppConfigurationSettings } from 'api/app_configuration/types';

import ProposedNotVoted from './ProposedNotVoted';
import ProposedVoted from './ProposedVoted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import Custom from './Custom';
import { openSignUpInModal } from 'events/openSignUpInModal';
import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';
import { trackEventByName } from 'utils/analytics';
import { openVerificationModal } from 'events/verificationModal';
import useAddInitiativeVote from 'api/initiative_votes/useAddInitiativeVote';
import useDeleteInitiativeVote from 'api/initiative_votes/useDeleteInitiativeVote';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import { IInitiativeData } from 'api/initiatives/types';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

const Container = styled.div`
  ${media.desktop`
    margin-bottom: 45px;
    padding: 35px;
    border: 1px solid #e0e0e0;
    ${defaultCardStyle};
  `}

  ${media.tablet`
    padding: 15px;
  `}
`;

interface VoteControlComponentProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: IAppConfigurationSettings['initiatives'];
  userVoted: boolean;
  onVote?: () => void;
  onCancelVote?: () => void;
  onScrollToOfficialFeedback?: () => void;
  disabledReason?: IInitiativeDisabledReason | null | undefined;
}

type TComponentMap = {
  [key in InitiativeStatusCode]: {
    [key in
      | 'voted'
      | 'notVoted']: React.ComponentType<VoteControlComponentProps>;
  };
};

/** Maps the initiative status and whether the user voted or not to the right component to render */
const componentMap: TComponentMap = {
  proposed: {
    voted: ProposedVoted,
    notVoted: ProposedNotVoted,
  },
  expired: {
    voted: Expired,
    notVoted: Expired,
  },
  threshold_reached: {
    voted: ThresholdReached,
    notVoted: ThresholdReached,
  },
  answered: {
    voted: Answered,
    notVoted: Answered,
  },
  ineligible: {
    voted: Ineligible,
    notVoted: Ineligible,
  },
  custom: {
    voted: Custom,
    notVoted: Custom,
  },
};

interface Props {
  initiativeId: string;
  className?: string;
  onScrollToOfficialFeedback: () => void;
  id?: string;
}

const VoteControl = ({
  className,
  onScrollToOfficialFeedback,
  id,
  initiativeId,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { mutate: addVote } = useAddInitiativeVote();
  const { mutate: deleteVote } = useDeleteInitiativeVote();
  const { data: initiativeStatus } = useInitiativeStatus(
    initiative?.data.relationships.initiative_status?.data?.id
  );
  const votingPermission = useInitiativesPermissions('voting_initiative');
  const handleOnvote = () => {
    const requiredAction = votingPermission?.action;
    switch (requiredAction) {
      case 'sign_in_up':
        trackEventByName(
          'Sign up/in modal opened in response to clicking vote initiative'
        );
        openSignUpInModal({
          flow: 'signup',
          verification: false,
          verificationContext: undefined,
          action: () => vote(),
        });
        break;
      case 'sign_in_up_and_verify':
        trackEventByName(
          'Sign up/in modal opened in response to clicking vote initiative'
        );
        openSignUpInModal({
          flow: 'signup',
          verification: true,
          verificationContext: {
            type: 'initiative',
            action: 'voting_initiative',
          },
          action: () => vote(),
        });
        break;
      case 'verify':
        trackEventByName(
          'Verification modal opened in response to clicking vote initiative'
        );
        openVerificationModal({
          context: {
            action: 'voting_initiative',
            type: 'initiative',
          },
        });
        break;
      default:
        vote();
    }
  };

  const vote = () => {
    if (!isNilOrError(initiative)) {
      addVote({ initiativeId: initiative.data.id, mode: 'up' });
    }
  };

  const handleOnCancelVote = () => {
    if (
      !isNilOrError(initiative) &&
      initiative.data.relationships?.user_vote?.data?.id
    ) {
      deleteVote({
        initiativeId: initiative.data.id,
        voteId: initiative.data.relationships.user_vote.data.id,
      });
    }
  };

  if (
    isNilOrError(initiative) ||
    isNilOrError(initiativeStatus) ||
    isNilOrError(appConfiguration) ||
    !appConfiguration.data.attributes.settings.initiatives
  ) {
    return null;
  }

  const expiresAt = moment(
    initiative.data.attributes.expires_at,
    'YYYY-MM-DDThh:mm:ss.SSSZ'
  );
  const durationAsSeconds = moment
    .duration(expiresAt.diff(moment()))
    .asSeconds();
  const isExpired = durationAsSeconds < 0;
  const statusCode =
    initiativeStatus.data.attributes.code === 'proposed' && isExpired
      ? 'expired'
      : initiativeStatus.data.attributes.code;
  const userVoted = !!(
    initiative.data.relationships.user_vote &&
    initiative.data.relationships.user_vote.data
  );
  const StatusComponent =
    componentMap[statusCode][userVoted ? 'voted' : 'notVoted'];
  const initiativeSettings =
    appConfiguration.data.attributes.settings.initiatives;

  return (
    <Container id={id} className={className || ''} aria-live="polite">
      <ScreenReaderOnly>
        <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
      </ScreenReaderOnly>
      <StatusComponent
        initiative={initiative.data}
        initiativeStatus={initiativeStatus.data}
        initiativeSettings={initiativeSettings}
        userVoted={userVoted}
        onVote={handleOnvote}
        onCancelVote={handleOnCancelVote}
        onScrollToOfficialFeedback={onScrollToOfficialFeedback}
        disabledReason={votingPermission?.disabledReason}
      />
    </Container>
  );
};

export default VoteControl;
