import React from 'react';
import moment from 'moment';

// components
import ProposedNotReacted from './ProposedNotReacted';
import ProposedReacted from './ProposedReacted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import Custom from './Custom';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';
import useAddInitiativeReaction from 'api/initiative_reactions/useAddInitiativeReaction';
import useDeleteInitiativeReaction from 'api/initiative_reactions/useDeleteInitiativeReaction';

// styling
import styled from 'styled-components';
import { media, defaultCardStyle } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';

// typings
import { IInitiativeData } from 'api/initiatives/types';
import {
  InitiativeStatusCode,
  IInitiativeStatusData,
} from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

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

interface ReactionControlComponentProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: IAppConfigurationSettings['initiatives'];
  userReacted: boolean;
  onReaction?: () => void;
  onCancelReaction?: () => void;
  onScrollToOfficialFeedback?: () => void;
  disabledReason?: IInitiativeDisabledReason | null | undefined;
}

type TComponentMap = {
  [key in InitiativeStatusCode]: {
    [key in
      | 'reacted'
      | 'notReacted']: React.ComponentType<ReactionControlComponentProps>;
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
  threshold_reached: {
    reacted: ThresholdReached,
    notReacted: ThresholdReached,
  },
  answered: {
    reacted: Answered,
    notReacted: Answered,
  },
  ineligible: {
    reacted: Ineligible,
    notReacted: Ineligible,
  },
  custom: {
    reacted: Custom,
    notReacted: Custom,
  },
};

interface Props {
  initiativeId: string;
  className?: string;
  onScrollToOfficialFeedback: () => void;
  id?: string;
}

const context = {
  type: 'initiative',
  action: 'reacting_initiative',
} as const;

const ReactionControl = ({
  className,
  onScrollToOfficialFeedback,
  id,
  initiativeId,
}: Props) => {
  const { data: appConfiguration } = useAppConfiguration();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { mutate: addReaction } = useAddInitiativeReaction();
  const { mutate: deleteReaction } = useDeleteInitiativeReaction();

  const reaction = () => {
    if (initiative) {
      addReaction({ initiativeId: initiative.data.id, mode: 'up' });
    }
  };

  const { data: initiativeStatus } = useInitiativeStatus(
    initiative?.data.relationships.initiative_status?.data?.id
  );
  const reactingPermission = useInitiativesPermissions('reacting_initiative');

  if (!initiative) return null;

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
          initiativeId: initiative.data.id,
        },
      };

      triggerAuthenticationFlow({
        flow: 'signup',
        context,
        successAction,
      });
    } else {
      reaction();
    }
  };

  const handleOnCancelReaction = () => {
    if (
      !isNilOrError(initiative) &&
      initiative.data.relationships?.user_reaction?.data?.id
    ) {
      deleteReaction({
        initiativeId: initiative.data.id,
        reactionId: initiative.data.relationships.user_reaction.data.id,
      });
    }
  };

  if (
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
  const userReacted = !!(
    initiative.data.relationships.user_reaction &&
    initiative.data.relationships.user_reaction.data
  );
  const StatusComponent =
    componentMap[statusCode][userReacted ? 'reacted' : 'notReacted'];
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
        userReacted={userReacted}
        onReaction={handleOnreaction}
        onCancelReaction={handleOnCancelReaction}
        onScrollToOfficialFeedback={onScrollToOfficialFeedback}
        disabledReason={reactingPermission?.disabledReason}
      />
    </Container>
  );
};

export default ReactionControl;
