import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import HelmetIntl from 'components/HelmetIntl';
import Modal from 'components/UI/Modal';
import GroupsListPanel from './GroupsListPanel';
import GroupCreationStep1 from './GroupCreationStep1';

// Global state
import { globalState, IAdminNoPadding, IGlobalStateService } from 'services/globalState';

// Styling
import styled from 'styled-components';

const Wrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: nowrap;
  heigth: 100%;
`;

const LeftPanel = styled(GroupsListPanel)`
  flex: 0 0 320px;
`;

const ChildWrapper = styled.div`
  background: white;
  flex: 1;
`;

// i18n
import messages from './messages';
import { IGroupData } from 'services/groups';

export interface Props {}
export interface State {
  groupCreationModal: false | 'step1' | IGroupData['attributes']['membership_type'];
}

class UsersPage extends React.Component<Props & WithRouterProps, State> {
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
  }

  closeGroupCreationModal = () => {
    this.setState({ groupCreationModal: false });
  }

  openStep2 = (groupType: IGroupData['attributes']['membership_type']) => {
    this.setState({ groupCreationModal: groupType });
  }

  render () {
    if (!this.props.location) return null;
    const { groupCreationModal } = this.state;

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />
        <Wrapper>
          <LeftPanel onCreateGroup={this.openGroupCreationModal} />
          <ChildWrapper>{this.props.children}</ChildWrapper>
        </Wrapper>
        <Modal fixedHeight={false} opened={groupCreationModal !== false} close={this.closeGroupCreationModal}>
          <>
            {groupCreationModal === 'step1' && <GroupCreationStep1 onOpenStep2={this.openStep2} />}
          </>
        </Modal>
      </>
    );
  }
}

export default withRouter<Props>(UsersPage);
