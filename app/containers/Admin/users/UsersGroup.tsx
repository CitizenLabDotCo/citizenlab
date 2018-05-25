// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik } from 'formik';

// utils
import { isNilOrError } from 'utils/helperUtils';

// Components
import GroupHeader from './GroupHeader';
import Modal from 'components/UI/Modal';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import UserTable from './UserTable';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Resources
import GetGroup, { GetGroupChildProps } from 'resources/GetGroup';

// Services
import { IGroupData, deleteGroup, updateGroup } from 'services/groups';

// Typings
import { API } from 'typings';
interface InputProps { }
interface DataProps {
  group: GetGroupChildProps;
}
interface Props extends InputProps, DataProps { }
export interface State {
  groupEditionModal: false | IGroupData['attributes']['membership_type'];
}

export class UsersGroup extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      groupEditionModal: false,
    };
  }

  closeGroupEditionModal = () => {
    this.setState({ groupEditionModal: false });
  }

  renderForm = (type: 'normal' | 'rules') => (props) => {
    if (type === 'normal') return <NormalGroupForm {...props} />;
    if (type === 'rules') return <RulesGroupForm {...props} />;
    return null;
  }

  openGroupEditionModal = () => {
    const { group } = this.props;

    if (!isNilOrError(group)) {
      this.setState({ groupEditionModal: group.attributes.membership_type });
    }
  }

  handleSubmitForm = (id) => (values: NormalFormValues | RulesFormValues, { setErrors, setSubmitting }) => {
    updateGroup(id, {
      ...values
    })
    .then(() => {
      this.closeGroupEditionModal();
    })
    .catch((errorResponse) => {
      const apiErrors = (errorResponse as API.ErrorResponse).json.errors;
      setErrors(apiErrors);
      setSubmitting(false);
    });
  }

  deleteGroup = (groupId: string) => () => {
    const deleteMessage = this.props.intl.formatMessage(messages.groupDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      deleteGroup(groupId);
    }
  }

  searchGroup = (searchTerm: string) => {
    // TODO: wire up the search with the Users Table query
    console.log(searchTerm);
  }

  render() {
    const { group } = this.props;
    const { groupEditionModal } = this.state;
    let ModalHeader;

    switch (groupEditionModal) {
      case 'manual':
        ModalHeader = <FormattedMessage tagName="h3" {...messages.modalHeaderManual} />;
        break;
      case 'rules':
        ModalHeader = <FormattedMessage tagName="h3" {...messages.modalHeaderRules} />;
        break;
    }

    if (!isNilOrError(group)) {
      return (
        <>
          <GroupHeader
            title={group.attributes.title_multiloc}
            smartGroup={group.attributes.membership_type === 'rules'}
            onEdit={this.openGroupEditionModal}
            onDelete={this.deleteGroup(group.id)}
            onSearch={this.searchGroup}
          />

          <UserTable groupId={group.id} />

          <Modal
            header={ModalHeader}
            fixedHeight={false}
            opened={groupEditionModal !== false}
            close={this.closeGroupEditionModal}
          >
            <>
              {groupEditionModal === 'manual' &&
                <Formik
                  initialValues={group.attributes}
                  validate={NormalGroupForm.validate}
                  render={this.renderForm('normal')}
                  onSubmit={this.handleSubmitForm(group.id)}
                />
              }

              {groupEditionModal === 'rules' &&
                <Formik
                  initialValues={group.attributes}
                  validate={RulesGroupForm.validate}
                  render={this.renderForm('rules')}
                  onSubmit={this.handleSubmitForm(group.id)}
                />
              }
            </>
          </Modal>
        </>
      );
    }

    return null;
  }
}

const UsersGroupWithHoCs = injectIntl<Props>(UsersGroup);

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetGroup id={inputProps.params.groupId} >
    {group => (<UsersGroupWithHoCs group={group} />)}
  </GetGroup>
));
