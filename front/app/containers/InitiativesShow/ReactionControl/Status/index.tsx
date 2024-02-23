import React from 'react';
import moment from 'moment';
import ProposedNotReacted from './ProposedNotReacted';
import ProposedReacted from './ProposedReacted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import ReviewPending from './ReviewPending';
import ChangesRequested from './ChangesRequested';
import { IInitiative, IInitiativeData } from 'api/initiatives/types';
import {
  InitiativeStatusCode,
  IInitiativeStatusData,
} from 'api/initiative_statuses/types';
import { ProposalsSettings } from 'api/app_configuration/types';
import useInitiativesPermissions, {
  InitiativePermissionsDisabledReason,
} from 'hooks/useInitiativesPermissions';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import { trackEventByName } from 'utils/analytics';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import useAddInitiativeReaction from 'api/initiative_reactions/useAddInitiativeReaction';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import useDeleteInitiativeReaction from 'api/initiative_reactions/useDeleteInitiativeReaction';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';

export interface StatusComponentProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: ProposalsSettings;
  userReacted: boolean;
  onReaction: () => void;
  onCancelReaction: () => void;
  onScrollToOfficialFeedback: () => void;
  disabledReason?: InitiativePermissionsDisabledReason | null | undefined;
}

type TComponentMap = {
  [key in InitiativeStatusCode]: {
    [key in
      | 'reacted'
      | 'notReacted']: React.ComponentType<StatusComponentProps>;
  };
};

/** Maps the initiative status and whether the user reacted or not to the right component to render */
const componentMap: TComponentMap = {
  proposed: {
    reacted: ProposedReacted,
    notReacted: ProposedNotReacted,
  },
  expired: {
    reacted: Expired,
    notReacted: Expired,
  },
  changes_requested: {
    reacted: ChangesRequested,
    notReacted: ChangesRequested,
  },
  review_pending: {
    reacted: ReviewPending,
    notReacted: ReviewPending,
  },
  answered: {
    reacted: Answered,
    notReacted: Answered,
  },
  threshold_reached: {
    reacted: ThresholdReached,
    notReacted: ThresholdReached,
  },
  ineligible: {
    reacted: Ineligible,
    notReacted: Ineligible,
  },
};

interface Props {
  initiative: IInitiative;
  onScrollToOfficialFeedback: () => void;
}

const Status = ({ initiative, onScrollToOfficialFeedback }: Props) => {
  const initiativeId = initiative.data.id;
  const { data: initiativeStatus } = useInitiativeStatus(
    initiative.data.relationships.initiative_status?.data?.id
  );
  const reactingPermission = useInitiativesPermissions('reacting_initiative');
  const { mutate: addReaction } = useAddInitiativeReaction();
  const { mutate: deleteReaction } = useDeleteInitiativeReaction({
    initiativeId,
  });
  const { data: appConfiguration } = useAppConfiguration();

  if (!initiativeStatus || !appConfiguration) return null;

  const reaction = () => {
    addReaction({ initiativeId, mode: 'up' });
  };

  const handleOnreaction = () => {
    const authenticationRequirements =
      reactingPermission?.authenticationRequirements;

    if (authenticationRequirements) {
      trackEventByName(
        'Sign up/in modal opened in response to clicking reaction initiative'
      );
      const successAction: SuccessAction = {
        name: 'reactionOnInitiative',
        params: {
          initiativeId,
        },
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context: {
          type: 'initiative',
          action: 'reacting_initiative',
        },
        successAction,
      });
    } else {
      reaction();
    }
  };

  const handleOnCancelReaction = () => {
    if (initiative.data.relationships.user_reaction?.data?.id) {
      deleteReaction({
        reactionId: initiative.data.relationships.user_reaction.data.id,
      });
    }
  };

  const expiresAt = moment(
    initiative.data.attributes.expires_at,
    'YYYY-MM-DDThh:mm:ss.SSSZ'
  );
  const durationAsSeconds = moment
    .duration(expiresAt.diff(moment()))
    .asSeconds();
  const isExpired = durationAsSeconds < 0;
  const userReacted = !!(
    initiative.data.relationships.user_reaction &&
    initiative.data.relationships.user_reaction.data
  );
  const statusCode =
    initiativeStatus.data.attributes.code === 'proposed' && isExpired
      ? 'expired'
      : initiativeStatus.data.attributes.code;
  const StatusComponent =
    componentMap[statusCode][userReacted ? 'reacted' : 'notReacted'];

  return (
    <StatusComponent
      initiative={initiative.data}
      initiativeStatus={initiativeStatus.data}
      initiativeSettings={appConfiguration.data.attributes.settings.initiatives}
      userReacted={userReacted}
      onReaction={handleOnreaction}
      onCancelReaction={handleOnCancelReaction}
      onScrollToOfficialFeedback={onScrollToOfficialFeedback}
      disabledReason={reactingPermission?.disabledReason}
    />
  );
};

export default Status;
