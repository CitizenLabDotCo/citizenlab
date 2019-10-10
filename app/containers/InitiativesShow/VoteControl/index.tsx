import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { media, ScreenReaderOnly } from 'utils/styleUtils';
import { FormattedMessage } from 'utils/cl-intl';
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
import PopContainer from 'components/UI/PopContainer';
import Unauthenticated from './Unauthenticated';

const Container = styled.div`
  ${media.biggerThanMaxTablet`
    margin-bottom: 45px;
    padding: 35px;
    border: 1px solid #e0e0e0;
    box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
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
  user: GetAuthUserChildProps;
}

interface State {
  showUnauthenticated: boolean;
}

interface Props extends InputProps, DataProps {}

class VoteControl extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      showUnauthenticated: false,
    };
  }

  handleOnvote = async () => {
    const { initiative, user } = this.props;
    if (isNilOrError(user)) {
      this.setState({ showUnauthenticated: true });
    } else if (!isNilOrError(initiative)) {
      await addVote(initiative.id, { mode: 'up' });
    }
  }

  handleOnCancelVote = async () => {
    const { initiative } = this.props;
    if (!isNilOrError(initiative) && initiative.relationships.user_vote && initiative.relationships.user_vote.data) {
      await deleteVote(initiative.id, initiative.relationships.user_vote.data.id);
    }
  }

  render() {
    const { initiative, initiativeStatus, tenant, className, onScrollToOfficialFeedback, id } = this.props;
    const { showUnauthenticated } = this.state;

    if (isNilOrError(initiative) ||
      isNilOrError(initiativeStatus) ||
      isNilOrError(tenant) ||
      !tenant.attributes.settings.initiatives
    ) return null;

    const statusCode = initiativeStatus.attributes.code;
    const userVoted = !!(initiative.relationships.user_vote && initiative.relationships.user_vote.data);
    const StatusComponent = componentMap[statusCode][userVoted ? 'voted' : 'notVoted'];
    const initiativeSettings = tenant.attributes.settings.initiatives;

    return (
      <Container id={id || ''} className={className || ''}>
        <ScreenReaderOnly>
          <FormattedMessage tagName="h3" {...messages.invisibleTitle} />
        </ScreenReaderOnly>
        {showUnauthenticated
          ?
            <PopContainer icon="lock-outlined">
              <Unauthenticated />
            </PopContainer>
          :
            <StatusComponent
              initiative={initiative}
              initiativeStatus={initiativeStatus}
              initiativeSettings={initiativeSettings}
              userVoted={userVoted}
              onVote={this.handleOnvote}
              onCancelVote={this.handleOnCancelVote}
              onScrollToOfficialFeedback={onScrollToOfficialFeedback}
            />
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  user: <GetAuthUser />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeStatus: ({ initiative, render }) => {
    if (!isNilOrError(initiative) && initiative.relationships.initiative_status && initiative.relationships.initiative_status.data) {
      return <GetInitiativeStatus id={initiative.relationships.initiative_status.data.id}>{render}</GetInitiativeStatus>;
    } else {
      return null;
    }
  },
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <VoteControl {...inputProps} {...dataProps} />}
  </Data>
);
