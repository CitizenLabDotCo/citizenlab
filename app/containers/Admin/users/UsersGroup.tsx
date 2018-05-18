// Libraries
import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// utils
import { isNilOrError } from 'utils/helperUtils';

// Components
import NoUsers from './NoUsers';
import GroupHeader from './GroupHeader';

import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// Resources
import GetGroup, { GetGroupChildProps } from 'resources/GetGroup';

// Services
import { deleteGroup } from 'services/groups';

// Typings
interface InputProps {}
interface DataProps {
  group: GetGroupChildProps;
}
interface Props extends InputProps, DataProps {}
export interface State {}

export class UsersGroup extends React.PureComponent<Props & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {};
  }

  editGroup = () => {

  }
  deleteGroup = (groupId: string) => () => {
    const deleteMessage = this.props.intl.formatMessage(messages.groupDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      deleteGroup(groupId);
    }
  }

  searchGroup = () => {

  }

  render() {
    const { group } = this.props;
    if (!isNilOrError(group)) {
      return (
        <>
          <GroupHeader
            title={group.attributes.title_multiloc}
            smartGroup={group.attributes.membership_type === 'rules'}
            onEdit={this.editGroup}
            onDelete={this.deleteGroup(group.id)}
            onSearch={this.searchGroup}
          />
          <NoUsers />
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
