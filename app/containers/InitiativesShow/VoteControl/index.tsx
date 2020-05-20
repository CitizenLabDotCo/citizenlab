import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';
import moment from 'moment';
import messages from './messages';
import { InitiativeStatusCode, IInitiativeStatusData } from 'services/initiativeStatuses';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeStatus, { GetInitiativeStatusChildProps } from 'resources/GetInitiativeStatus';
import { IInitiativeData } from 'services/initiatives';
import { ITenantSettings } from 'services/tenant';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
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

const Container = styled.div`
  ${media.biggerThanMaxTablet`
    margin-bottom: 45px;
    padding: 35px;
    border: 1px solid #eee;
    box-shadow: 0px 2px 2px -1px rgba(152, 162, 179, 0.3), 0px 1px 5px -2px rgba(152, 162, 179, 0.3);
    border-radius: ${(props: any) => props.theme.borderRadius};
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
}

type TComponentMap = {
  [key in InitiativeStatusCode]: {
    [key in 'voted' | 'notVoted']: React.ComponentType<VoteControlComponentProps>
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
}

interface State {}

interface Props extends InputProps, DataProps {}

class VoteControl extends PureComponent<Props, State> {

  handleOnvote = () => {
    const { initiative, authUser } = this.props;

    if (!isNilOrError(initiative)) {
      if (!isNilOrError(authUser)) {
        addVote(initiative.id, { mode: 'up' });
      } else {
        openSignUpInModal({
          action: () => this.handleOnvote()
        });
      }
    }
  }

  handleOnCancelVote = () => {
    const { initiative } = this.props;

    if (!isNilOrError(initiative) && initiative.relationships?.user_vote?.data?.id) {
      deleteVote(initiative.id, initiative.relationships.user_vote.data.id);
    }
  }

  render() {
    const { initiative, initiativeStatus, tenant, className, onScrollToOfficialFeedback, id } = this.props;

    if (
      isNilOrError(initiative) ||
      isNilOrError(initiativeStatus) ||
      isNilOrError(tenant) ||
      !tenant.attributes.settings.initiatives
    ) {
      return null;
    }

    const expiresAt = moment(initiative.attributes.expires_at, 'YYYY-MM-DDThh:mm:ss.SSSZ');
    const durationAsSeconds = moment.duration(expiresAt.diff(moment())).asSeconds();
    const isExpired = (durationAsSeconds < 0);
    const statusCode = initiativeStatus.attributes.code === 'proposed' && isExpired ? 'expired' : initiativeStatus.attributes.code;
    const userVoted = !!(initiative.relationships.user_vote && initiative.relationships.user_vote.data);
    const StatusComponent = componentMap[statusCode][userVoted ? 'voted' : 'notVoted'];
    const initiativeSettings = tenant.attributes.settings.initiatives;

    return (
      <Container
        id={id || ''}
        className={className || ''}
        aria-live="polite"
      >
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
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  authUser: <GetAuthUser />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeStatus: ({ initiative, render }) => {
    if (!isNilOrError(initiative) && initiative.relationships.initiative_status && initiative.relationships.initiative_status.data) {
      return <GetInitiativeStatus id={initiative.relationships.initiative_status.data.id}>{render}</GetInitiativeStatus>;
    }

    return null;
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <VoteControl {...inputProps} {...dataProps} />}
  </Data>
);
