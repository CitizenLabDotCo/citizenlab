import React from 'react';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import moment from 'moment';

import { trackEventByName } from 'utils/analytics';

import { ProposalsSettings } from 'api/app_configuration/types';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useAddInitiativeReaction from 'api/initiative_reactions/useAddInitiativeReaction';
import {
  InitiativeStatusCode,
  IInitiativeStatusData,
} from 'api/initiative_statuses/types';
import { IInitiative, IInitiativeData } from 'api/initiatives/types';
import Answered from './Status/Answered';
import Expired from './Status/Expired';
import Proposed from './Status/Proposed';
import ThresholdReached from './Status/ThresholdReached';
import Ineligible from './Status/Ineligible';
import ReviewPending from './Status/ReviewPending';
import ChangesRequested from './Status/ChangesRequested';

import useInitiativesPermissions, {
  InitiativePermissionsDisabledReason,
} from 'hooks/useInitiativesPermissions';

import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';

import useDeleteInitiativeReaction from 'api/initiative_reactions/useDeleteInitiativeReaction';

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

/** Maps the initiative status and whether the user reacted or not to the right component to render */
const componentMap: {
  [key in InitiativeStatusCode]: React.ComponentType<StatusComponentProps>;
} = {
  proposed: Proposed,
  expired: Expired,
  changes_requested: ChangesRequested,
  review_pending: ReviewPending,
  answered: Answered,
  threshold_reached: ThresholdReached,
  ineligible: Ineligible,
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
  const userReacted = !!initiative.data.relationships.user_reaction?.data;
  const isExpired = durationAsSeconds < 0;
  const statusCode =
    initiativeStatus.data.attributes.code === 'proposed' && isExpired
      ? 'expired'
      : initiativeStatus.data.attributes.code;
  const StatusComponent = componentMap[statusCode];

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
