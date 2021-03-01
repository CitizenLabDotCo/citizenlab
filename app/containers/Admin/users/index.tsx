import React, { PureComponent } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik, FormikActions } from 'formik';

// Resources
import GetFeatureFlag, {
  GetFeatureFlagChildProps,
} from 'resources/GetFeatureFlag';

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
  ${media.smallerThan1280px`
    left: 80px;
  `}
`;

const LeftPanel = styled(GroupsListPanel)`
  width: 300px;
  flex: 0 0 300px;

  ${media.smallerThan1280px`
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

// Typings
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';
import Outlet from 'components/Outlet';

export interface Props {
  isVerificationEnabled: GetFeatureFlagChildProps;
}

export type GroupCreationModal = false | 'step1' | MembershipType;

export interface State {
  groupCreationModal: GroupCreationModal;
}

class UsersPage extends PureComponent<Props & WithRouterProps, State> {
  globalState: IGlobalStateService<IAdminNoPadding>;

  constructor(props) {
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

  handleSubmitForm = (
    values: NormalFormValues,
    { setErrors, setSubmitting, setStatus }: FormikActions<NormalFormValues>
  ) => {
    addGroup({ ...values })
      .then(() => {
        this.closeGroupCreationModal();
      })
      .catch((errorResponse) => {
        if (isCLErrorJSON(errorResponse)) {
          const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
          setErrors(apiErrors);
        } else {
          setStatus('error');
        }
        setSubmitting(false);
      });
  };

  renderNormalGroupForm = (props) => <NormalGroupForm {...props} />;

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
          <ChildWrapper>{this.props.children}</ChildWrapper>
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
              <Formik
                initialValues={{
                  title_multiloc: {},
                  membership_type: 'manual',
                }}
                validate={NormalGroupForm.validate}
                render={this.renderNormalGroupForm}
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

const UsersPageWithHocs = withRouter<Props>(UsersPage);

export default (props) => (
  <GetFeatureFlag name="verification">
    {(isVerificationEnabled) => (
      <UsersPageWithHocs
        {...props}
        isVerificationEnabled={isVerificationEnabled}
      />
    )}
  </GetFeatureFlag>
);
