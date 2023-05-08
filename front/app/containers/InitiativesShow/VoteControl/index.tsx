import React from 'react';
import moment from 'moment';

// components
import ProposedNotVoted from './ProposedNotVoted';
import ProposedVoted from './ProposedVoted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import Custom from './Custom';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// hooks
import useAddInitiativeVote from 'api/initiative_votes/useAddInitiativeVote';
import useDeleteInitiativeVote from 'api/initiative_votes/useDeleteInitiativeVote';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useInitiativeStatus from 'api/initiative_statuses/useInitiativeStatus';
import useInitiativesPermissions, {
  IInitiativeDisabledReason,
} from 'hooks/useInitiativesPermissions';

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

const context = {
  type: 'initiative',
  action: 'voting_initiative',
} as const;

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

  const vote = () => {
    if (initiative) {
      addVote({ initiativeId: initiative.data.id, mode: 'up' });
    }
  };

  const { data: initiativeStatus } = useInitiativeStatus(
    initiative?.data.relationships.initiative_status?.data?.id
  );
  const votingPermission = useInitiativesPermissions('voting_initiative');

  if (!initiative) return null;

  const handleOnvote = () => {
    const authenticationRequirements =
      votingPermission?.authenticationRequirements;

    if (authenticationRequirements) {
      trackEventByName(
        'Sign up/in modal opened in response to clicking vote initiative'
      );
      const successAction: SuccessAction = {
        name: 'voteOnInitiative',
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
      vote();
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
