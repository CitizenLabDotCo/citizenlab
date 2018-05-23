import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik } from 'formik';

// components
import HelmetIntl from 'components/HelmetIntl';
import Modal from 'components/UI/Modal';
import GroupsListPanel from './GroupsListPanel';
import GroupCreationStep1 from './GroupCreationStep1';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';

// Global state
import { globalState, IAdminNoPadding, IGlobalStateService } from 'services/globalState';

// Styling
import styled from 'styled-components';

const Wrapper = styled.div`
  align-items: stretch;
  display: flex;
  flex-wrap: nowrap;
  height: 100%;
`;

const LeftPanel = styled(GroupsListPanel)`
  flex: 0 0 320px;
`;

const ChildWrapper = styled.div`
  background: white;
  flex: 1;
  padding: 50px;
`;

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Services
import { IGroupData, addGroup } from 'services/groups';


// Typings
import { API } from 'typings';

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

  renderForm = (type: 'normal' | 'rules') => (props) => {
    if (type === 'normal') return <NormalGroupForm {...props} />;
    if (type === 'rules') return <RulesGroupForm {...props} />;
    return null;
  }

  handleSubmitForm = (values: NormalFormValues | RulesFormValues, { setErrors, setSubmitting }) => {
    addGroup({ ...values })
    .then(() => {
      this.closeGroupCreationModal();
    })
    .catch((errorResponse) => {
      const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    });
  }

  render () {
    if (!this.props.location) return null;
    const { groupCreationModal } = this.state;

    let ModalHeader;
    switch (groupCreationModal) {
      case 'step1':
        ModalHeader = <FormattedMessage tagName="h3" {...messages.modalHeaderStep1} />;
        break;
      case 'manual':
        ModalHeader = <FormattedMessage tagName="h3" {...messages.modalHeaderManual} />;
        break;
      case 'rules':
        ModalHeader = <FormattedMessage tagName="h3" {...messages.modalHeaderRules} />;
        break;
    }

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
        <Modal header={ModalHeader} fixedHeight={false} opened={groupCreationModal !== false} close={this.closeGroupCreationModal}>
          <>
            {groupCreationModal === 'step1' && <GroupCreationStep1 onOpenStep2={this.openStep2} />}
            {groupCreationModal === 'manual' &&
              <Formik
                initialValues={{ title_multiloc: {} }}
                validate={NormalGroupForm.validate}
                render={this.renderForm('normal')}
                onSubmit={this.handleSubmitForm}
              />
            }
            {groupCreationModal === 'rules' &&
              <Formik
                initialValues={{ title_multiloc: {}, rules: [], membership_type: 'rules' }}
                validate={RulesGroupForm.validate}
                render={this.renderForm('rules')}
                onSubmit={this.handleSubmitForm}
              />
            }
          </>
        </Modal>
      </>
    );
  }
}

export default withRouter<Props>(UsersPage);
