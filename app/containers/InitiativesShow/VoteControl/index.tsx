import React, { PureComponent } from 'react';
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
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeStatus, {
  GetInitiativeStatusChildProps,
} from 'resources/GetInitiativeStatus';
import { IInitiativeData } from 'services/initiatives';
import { ITenantSettings } from 'services/tenant';
import GetAppConfiguration, { GetTenantChildProps } from 'resources/GetTenant';
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { addVote, deleteVote } from 'services/initiativeVotes';
import ProposedNotVoted from './ProposedNotVoted';
import ProposedVoted from './ProposedVoted';
import Expired from './Expired';
import ThresholdReached from './ThresholdReached';
import Answered from './Answered';
import Ineligible from './Ineligible';
import Custom from './Custom';
import { openSignUpInModal } from 'components/SignUpIn/events';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';
import { IInitiativeDisabledReason } from 'hooks/useInitiativesPermissions';
import { trackEventByName } from 'utils/analytics';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

const Container = styled.div`
  ${media.biggerThanMaxTablet`
    margin-bottom: 45px;
    padding: 35px;
    border: 1px solid #e0e0e0;
    ${defaultCardStyle};
  `}

  ${media.smallerThanMaxTablet`
    padding: 15px;
  `}
`;

interface VoteControlComponentProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: ITenantSettings['initiatives'];
  userVoted: boolean;
  onVote?: () => void;
  onCancelVote?: () => void;
  onScrollToOfficialFeedback?: () => void;
  disabledReason?: IInitiativeDisabledReason | null | undefined;
}

type TComponentMap = {
  [key in InitiativeStatusCode]: {
    [key in 'voted' | 'notVoted']: React.ComponentType<
      VoteControlComponentProps
    >;
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

interface DataProps {
  tenant: GetTenantChildProps;
  initiative: GetInitiativeChildProps;
  initiativeStatus: GetInitiativeStatusChildProps;
  authUser: GetAuthUserChildProps;
  votingPermission: GetInitiativesPermissionsChildProps;
}

interface State {}

interface Props extends InputProps, DataProps {}

class VoteControl extends PureComponent<Props, State> {
  handleOnvote = () => {
    const { votingPermission } = this.props;
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
          action: () => this.vote(),
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
          action: () => this.vote(),
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
        this.vote();
    }
  };

  vote = () => {
    const { initiative } = this.props;

    if (!isNilOrError(initiative)) {
      addVote(initiative.id, { mode: 'up' });
    }
  };

  handleOnCancelVote = () => {
    const { initiative } = this.props;

    if (
      !isNilOrError(initiative) &&
      initiative.relationships?.user_vote?.data?.id
    ) {
      deleteVote(initiative.id, initiative.relationships.user_vote.data.id);
    }
  };

  render() {
    const {
      initiative,
      initiativeStatus,
      tenant,
      className,
      onScrollToOfficialFeedback,
      id,
      votingPermission,
    } = this.props;
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
      <Container id={id || ''} className={className || ''} aria-live="polite">
        <ScreenReaderOnly>
          <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
        </ScreenReaderOnly>
        <StatusComponent
          initiative={initiative}
          initiativeStatus={initiativeStatus}
          initiativeSettings={initiativeSettings}
          userVoted={userVoted}
          onVote={this.handleOnvote}
          onCancelVote={this.handleOnCancelVote}
          onScrollToOfficialFeedback={onScrollToOfficialFeedback}
          disabledReason={votingPermission?.disabledReason}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetAppConfiguration />,
  authUser: <GetAuthUser />,
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
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

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <VoteControl {...inputProps} {...dataProps} />}
  </Data>
);
