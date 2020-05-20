import React, { PureComponent } from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik, FormikErrors } from 'formik';
import { isEmpty, values as getValues, every } from 'lodash-es';

// Resources
import GetFeatureFlag, { GetFeatureFlagChildProps } from 'resources/GetFeatureFlag';

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
import { media } from 'utils/styleUtils';

const Wrapper = styled.div`
  height: calc(100vh - ${props => props.theme.menuHeight}px - 1px);
  display: flex;
  background: #fff;
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
import { IGroupData, addGroup } from 'services/groups';

// Typings
import { CLErrorsJSON } from 'typings';
import { isCLErrorJSON } from 'utils/errorUtils';

export interface Props {
  verificationActive: GetFeatureFlagChildProps;
}

export interface State {
  groupCreationModal: false | 'step1' | IGroupData['attributes']['membership_type'];
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

  handleSubmitForm = (values: NormalFormValues | RulesFormValues, { setErrors, setSubmitting, setStatus }) => {
    addGroup({ ...values }).then(() => {
      this.closeGroupCreationModal();
    }).catch((errorResponse) => {
      if (isCLErrorJSON(errorResponse)) {
        const apiErrors = (errorResponse as CLErrorsJSON).json.errors;
        setErrors(apiErrors);
      } else {
        setStatus('error');
      }
      setSubmitting(false);
    });
  }

  validateRulesWithFeatureFlag = (values: RulesFormValues) => {
    const errors: FormikErrors<RulesFormValues> = {};

    if (every(getValues(values.title_multiloc), isEmpty)) {
      errors.title_multiloc = [{ error: 'blank' }] as any;
    }

    if (!this.props.verificationActive
      && values.rules.find(rule => rule.ruleType === 'verified')) {
      errors.rules = 'verificationDisabled' as any;
    }

    return errors;
  }

  render() {
    if (!this.props.location) return null;

    const { groupCreationModal } = this.state;

    let ModalHeader;
    switch (groupCreationModal) {
      case 'step1':
        ModalHeader = <FormattedMessage {...messages.modalHeaderStep1} />;
        break;
      case 'manual':
        ModalHeader = <FormattedMessage {...messages.modalHeaderManual} />;
        break;
      case 'rules':
        ModalHeader = <FormattedMessage {...messages.modalHeaderRules} />;
        break;
    }

    return (
      <>
        <HelmetIntl
          title={messages.helmetTitle}
          description={messages.helmetDescription}
        />

        <Wrapper>
          <LeftPanel className="e2e-left-panel" onCreateGroup={this.openGroupCreationModal} />
          <ChildWrapper>{this.props.children}</ChildWrapper>
        </Wrapper>

        <Modal
          header={ModalHeader}
          opened={groupCreationModal !== false}
          close={this.closeGroupCreationModal}
        >
          <>
            {groupCreationModal === 'step1' &&
              <GroupCreationStep1 onOpenStep2={this.openStep2} />
            }

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
                initialValues={{ title_multiloc: {}, rules: [{}], membership_type: 'rules' }}
                validate={this.validateRulesWithFeatureFlag}
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

const UsersPageWithHocs = withRouter<Props>(UsersPage);

export default (props) => (
  <GetFeatureFlag name="verification">
    {verificationActive =>
      <UsersPageWithHocs {...props} verificationActive={verificationActive} />
    }
  </GetFeatureFlag>
);
