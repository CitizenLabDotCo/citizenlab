import React, { PureComponent } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { Outlet as RouterOutlet } from 'react-router-dom';

// Resources

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

export interface Props {}

export type GroupCreationModal = false | 'step1' | MembershipType;

export interface State {
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
    return <FormattedMessage {...messages.modalHeaderStep1} />;
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
          </>
        </Modal>
      </>
    );
  }
}

const UsersPageWithHocs = withRouter(UsersPage);

export default UsersPageWithHocs;
