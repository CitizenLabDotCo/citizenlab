import React, { PureComponent } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// Resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

// Channels
import consumer from '../../../../src/cable';

// components
import HelmetIntl from 'components/HelmetIntl';
import Modal from 'components/UI/Modal';
import GroupsListPanel from './GroupsListPanel';
import GroupCreationStep1 from './GroupCreationStep1';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';

// Global state
import {
  globalState,
  IAdminNoPadding,
  IGlobalStateService,
} from 'services/globalState';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Wrapper = styled.div`
  height: calc(100vh - ${(props) => props.theme.menuHeight}px);
  display: flex;
  background: #fff;
  position: fixed;
  right: 0;
  top: ${(props) => props.theme.menuHeight}px;
  left: 210px;
  bottom: 0;
  ${media.tablet`
    left: 80px;
  `}
`;

const LeftPanel = styled(GroupsListPanel)`
  width: 300px;
  flex: 0 0 300px;

  ${media.tablet`
    width: 260px;
    flex: 0 0 260px;
  `}
`;

const ChildWrapper = styled.div`
  flex: 1;
  padding: 50px;
  background: white;
  overflow-x: auto;
  overflow-y: auto;
`;

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Services
import { IGroupData, addGroup, MembershipType } from 'services/groups';

import Outlet from 'components/Outlet';

interface DataProps {
  isVerificationEnabled: GetFeatureFlagChildProps;
}

interface Props extends DataProps {}

export type GroupCreationModal = false | 'step1' | MembershipType;

interface State {
  groupCreationModal: GroupCreationModal;
}

class UsersPage extends PureComponent<Props & WithRouterProps, State> {
  globalState: IGlobalStateService<IAdminNoPadding>;

  constructor(props: Props & WithRouterProps) {
    super(props);
    this.globalState = globalState.init('AdminNoPadding', { enabled: true });
    this.state = {
      groupCreationModal: false,
    };
  }

  componentDidMount() {
    this.globalState.set({ enabled: true });

    // These have never logged anything, so far
    consumer.connection.onOpen = () => {
      console.log('WebSocket connection opened');
    };

    consumer.connection.onClose = () => {
      console.log('WebSocket connection closed');
    };

    consumer.connection.onError = () => {
      console.log('WebSocket connection error');
    };

    // These log connection present, but not connected
    if (consumer.connection) {
      console.log('Action Cable connection is present');

      if (consumer.connection.state === 'connected') {
        console.log('Action Cable connection is connected');
      } else {
        console.log('Action Cable connection is not connected');
      }
    } else {
      console.log('Action Cable connection is not present');
    }

    console.log('consumer.subscriptions.create() function is being called');
    consumer.subscriptions.create(
      {
        channel: 'UsersBlockedCountChannel',
      },
      {
        // These have never logged anything, so far
        connected: () => console.log('connected'),
        disconnected: () => console.log('disconnected'),
        received: (data) => console.log('Received data:', data),
        rejected: () => console.log('rejected'),
        error: (error) => console.error(error),
      }
    );

    console.log('hello from componentDidMount');
  }

  componentWillUnmount() {
    this.globalState.set({ enabled: false });
  }

  openGroupCreationModal = () => {
    this.setState({ groupCreationModal: 'step1' });
  };

  closeGroupCreationModal = () => {
    this.setState({ groupCreationModal: false });
  };

  openStep2 = (groupType: IGroupData['attributes']['membership_type']) => {
    this.setState({ groupCreationModal: groupType });
  };

  handleSubmitForm = async (values: NormalFormValues) => {
    await addGroup({ ...values });
    this.closeGroupCreationModal();
  };

  renderModalHeader = () => {
    const { groupCreationModal } = this.state;
    if (groupCreationModal === 'step1') {
      return <FormattedMessage {...messages.modalHeaderStep1} />;
    }
    if (groupCreationModal === 'manual') {
      return <FormattedMessage {...messages.modalHeaderStep1} />;
    }
    return (
      <Outlet
        id="app.containers.Admin.users.header"
        type={groupCreationModal}
      />
    );
  };

  render() {
    if (!this.props.location) return null;

    const { groupCreationModal } = this.state;

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <Wrapper>
          <LeftPanel
            className="e2e-left-panel"
            onCreateGroup={this.openGroupCreationModal}
          />
          <ChildWrapper id="e2e-users-container">
            <RouterOutlet />
          </ChildWrapper>
        </Wrapper>

        <Modal
          header={this.renderModalHeader()}
          opened={groupCreationModal !== false}
          close={this.closeGroupCreationModal}
        >
          <>
            {groupCreationModal === 'step1' && (
              <GroupCreationStep1 onOpenStep2={this.openStep2} />
            )}

            {groupCreationModal === 'manual' && (
              <NormalGroupForm
                defaultValues={{
                  membership_type: 'manual',
                }}
                onSubmit={this.handleSubmitForm}
              />
            )}

            <Outlet
              id="app.containers.Admin.users.form"
              type={groupCreationModal}
              onSubmit={this.handleSubmitForm}
              isVerificationEnabled={this.props.isVerificationEnabled}
            />
          </>
        </Modal>
      </>
    );
  }
}

const UsersPageWithHocs = withRouter(UsersPage);

export default () => (
  <GetFeatureFlag name="verification">
    {(isVerificationEnabled) => (
      <UsersPageWithHocs isVerificationEnabled={isVerificationEnabled} />
    )}
  </GetFeatureFlag>
);
