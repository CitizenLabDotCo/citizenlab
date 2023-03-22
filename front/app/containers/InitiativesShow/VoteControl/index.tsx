import React from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
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
import GetInitiativeStatus, {
  GetInitiativeStatusChildProps,
} from 'resources/GetInitiativeStatus';
import { IAppConfigurationSettings } from 'api/app_configuration/types';
import GetAppConfiguration, {
  GetAppConfigurationChildProps,
} from 'resources/GetAppConfiguration';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import ProposedNotVoted from './ProposedNotVoted';
import ProposedVoted from './ProposedVoted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import Custom from './Custom';
import { openSignUpInModal } from 'events/openSignUpInModal';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';
import { IInitiativeDisabledReason } from 'hooks/useInitiativesPermissions';
import { trackEventByName } from 'utils/analytics';
import { openVerificationModal } from 'events/verificationModal';
import useAddInitiativeVote from 'api/initiative_votes/useAddInitiativeVote';
import useDeleteInitiativeVote from 'api/initiative_votes/useDeleteInitiativeVote';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import { IInitiativeData } from 'api/initiatives/types';

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

interface InputProps {
  initiativeId: string;
  className?: string;
  onScrollToOfficialFeedback: () => void;
  id?: string;
}

interface IntiativeInputProps {
  initiative: IInitiativeData;
}

interface DataProps {
  tenant: GetAppConfigurationChildProps;
  initiativeStatus: GetInitiativeStatusChildProps;
  authUser: GetAuthUserChildProps;
  votingPermission: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps, IntiativeInputProps {}

const context = {
  type: 'initiative',
  action: 'voting_initiative',
} as const;

const VoteControl = ({
  initiative,
  initiativeStatus,
  tenant,
  className,
  onScrollToOfficialFeedback,
  id,
  votingPermission,
}: Props) => {
  const { mutate: addVote } = useAddInitiativeVote();
  const { mutate: deleteVote } = useDeleteInitiativeVote();
  const handleOnvote = () => {
    const authenticationRequirements =
      votingPermission?.authenticationRequirements;

    switch (authenticationRequirements) {
      case 'sign_in_up':
        trackEventByName(
          'Sign up/in modal opened in response to clicking vote initiative'
        );
        openSignUpInModal({
          flow: 'signup',
          verification: false,
          context,
          onSuccess: () => vote(),
        });
        break;
      case 'sign_in_up_and_verify':
        trackEventByName(
          'Sign up/in modal opened in response to clicking vote initiative'
        );
        openSignUpInModal({
          flow: 'signup',
          verification: true,
          context,
          onSuccess: () => vote(),
        });
        break;
      case 'verify':
        trackEventByName(
          'Verification modal opened in response to clicking vote initiative'
        );
        openVerificationModal({ context });
        break;
      default:
        vote();
    }
  };

  const vote = () => {
    if (!isNilOrError(initiative)) {
      addVote({ initiativeId: initiative.id, mode: 'up' });
    }
  };

  const handleOnCancelVote = () => {
    if (
      !isNilOrError(initiative) &&
      initiative.relationships?.user_vote?.data?.id
    ) {
      deleteVote({
        initiativeId: initiative.id,
        voteId: initiative.relationships.user_vote.data.id,
      });
    }
  };

  if (
    isNilOrError(initiative) ||
    isNilOrError(initiativeStatus) ||
    isNilOrError(tenant) ||
    !tenant.attributes.settings.initiatives
  ) {
    return null;
  }

  const expiresAt = moment(
    initiative.attributes.expires_at,
    'YYYY-MM-DDThh:mm:ss.SSSZ'
  );
  const durationAsSeconds = moment
    .duration(expiresAt.diff(moment()))
    .asSeconds();
  const isExpired = durationAsSeconds < 0;
  const statusCode =
    initiativeStatus.attributes.code === 'proposed' && isExpired
      ? 'expired'
      : initiativeStatus.attributes.code;
  const userVoted = !!(
    initiative.relationships.user_vote &&
    initiative.relationships.user_vote.data
  );
  const StatusComponent =
    componentMap[statusCode][userVoted ? 'voted' : 'notVoted'];
  const initiativeSettings = tenant.attributes.settings.initiatives;

  return (
    <Container id={id} className={className || ''} aria-live="polite">
      <ScreenReaderOnly>
        <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
      </ScreenReaderOnly>
      <StatusComponent
        initiative={initiative}
        initiativeStatus={initiativeStatus}
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

const Data = adopt<DataProps, InputProps & IntiativeInputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  initiativeStatus: ({ initiative, render }) => {
    if (
      !isNilOrError(initiative) &&
      initiative.relationships.initiative_status &&
      initiative.relationships.initiative_status.data
    ) {
      return (
        <GetInitiativeStatus
          id={initiative.relationships.initiative_status.data.id}
        >
          {render}
        </GetInitiativeStatus>
      );
    }

    return null;
  },
  votingPermission: <GetInitiativesPermissions action="voting_initiative" />,
});

export default (inputProps: InputProps) => {
  // TODO: Move this logic to VoteControl after working on the initiativeStatus. It's dependency here is why we need to pass in the initiative to the Data component
  const { data: initiative } = useInitiativeById(inputProps.initiativeId);
  if (!initiative) return null;

  return (
    <Data {...inputProps} initiative={initiative.data}>
      {(dataProps) => (
        <VoteControl
          {...inputProps}
          {...dataProps}
          initiative={initiative.data}
        />
      )}
    </Data>
  );
};
