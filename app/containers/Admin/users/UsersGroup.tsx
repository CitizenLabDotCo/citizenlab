// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';
import { Formik } from 'formik';
import { isString, isEmpty } from 'lodash';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

// Components
import UsersHeader from './UsersHeader';
import Modal from 'components/UI/Modal';
import NormalGroupForm, { NormalFormValues } from './NormalGroupForm';
import RulesGroupForm, { RulesFormValues } from './RulesGroupForm';
import UserManager from './UserManager';

// Events
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Resources
import GetGroup, { GetGroupChildProps } from 'resources/GetGroup';

// Services
import { deleteGroup, updateGroup, MembershipType } from 'services/groups';
import { deleteMembershipByUserId } from 'services/groupMemberships';

// tracking
import { injectTracks } from 'utils/analytics';
import tracks from './tracks';

// Typings
import { API } from 'typings';
interface InputProps { }

interface DataProps {
  group: GetGroupChildProps;
}

interface Props extends InputProps, DataProps { }

export interface State {
  groupEditionModal: false | MembershipType;
  search: string | undefined;
}

interface Tracks {
  trackEditGroup: Function;
}

export class UsersGroup extends React.PureComponent<Props & InjectedIntlProps & Tracks, State> {
  constructor(props) {
    super(props);
    this.state = {
      groupEditionModal: false,
      search: undefined,
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
    const { group, trackEditGroup } = this.props;

    if (!isNilOrError(group)) {
      const groupType =  group.attributes.membership_type;
      trackEditGroup({
        extra: {
          groupType,
        }
      });
      this.setState({ groupEditionModal: groupType });
    }
  }

  handleSubmitForm = (id) => (values: NormalFormValues | RulesFormValues, { setErrors, setSubmitting }) => {
    updateGroup(id, { ...values }).then(() => {
      streams.fetchAllActiveStreamsWithEndpoint(`${API_PATH}/users`);
      this.closeGroupEditionModal();
    }).catch((errorResponse) => {
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
    this.setState({
      search: (isString(searchTerm) && !isEmpty(searchTerm) ? searchTerm : '')
    });
  }

  deleteUsersFromGroup = (userIds: string[]) => {
    if (!isNilOrError(this.props.group) && this.props.group.attributes.membership_type === 'manual') {
      const deleteMessage = this.props.intl.formatMessage(messages.membershipDeleteConfirmation);
      if (window.confirm(deleteMessage)) {
        const groupId = this.props.group.id;
        const promises: Promise<any>[] = [];
        userIds.forEach(userId => promises.push(deleteMembershipByUserId(groupId, userId)));
        Promise.all(promises).catch(() => {
          eventEmitter.emit<JSX.Element>('usersAdmin', events.membershipDeleteFailed, <FormattedMessage {...messages.membershipDeleteFailed} />);
        });
      }
    }
  }

  render() {
    const { group } = this.props;
    const { groupEditionModal, search } = this.state;
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
          <UsersHeader
            title={group.attributes.title_multiloc}
            smartGroup={group.attributes.membership_type === 'rules'}
            onEdit={this.openGroupEditionModal}
            onDelete={this.deleteGroup(group.id)}
            onSearch={this.searchGroup}
          />

          <UserManager
            search={search}
            groupId={group.id}
            groupType={group.attributes.membership_type}
            deleteUsersFromGroup={this.deleteUsersFromGroup}
          />

          <Modal
            header={ModalHeader}
            fixedHeight={true}
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

const UsersGroupWithHoCs = injectTracks<Props>({
  trackEditGroup: tracks.editGroup,
})(injectIntl<Props>(UsersGroup));

export default withRouter((inputProps: WithRouterProps) => (
  <GetGroup id={inputProps.params.groupId}>
    {group => <UsersGroupWithHoCs {...inputProps} group={group} />}
  </GetGroup>
));
