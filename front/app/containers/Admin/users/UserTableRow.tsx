// Libraries
import React, { PureComponent, FormEvent } from 'react';
import { isAdmin } from 'services/permissions/roles';
import moment from 'moment';
import clHistory from 'utils/cl-router/history';

// Components
import { Tr, Td, Toggle, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

// Translation
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from './messages';

// Events --- For error handling
import eventEmitter from 'utils/eventEmitter';
import events from './events';

// Services
import { IUserData, deleteUser } from 'services/users';

// Typings
import { GetAuthUserChildProps } from 'resources/GetAuthUser';

// Styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const RegisteredAt = styled(Td)`
  white-space: nowrap;
`;

interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  toggleAdmin: () => void;
  authUser: GetAuthUserChildProps;
}

interface State {
  isAdmin: boolean;
  registeredAt: string;
}

class UserTableRow extends PureComponent<Props & WrappedComponentProps, State> {
  constructor(props: Props & WrappedComponentProps) {
    super(props);
    this.state = {
      isAdmin: isAdmin({ data: this.props.user }),
      registeredAt: moment(
        this.props.user.attributes.registration_completed_at
      ).format('LL'),
    };
  }

  static getDerivedStateFromProps(nextProps: Props, _prevState: State) {
    return {
      isAdmin: isAdmin({ data: nextProps.user }),
      registeredAt: moment(
        nextProps.user.attributes.registration_completed_at
      ).format('LL'),
    };
  }

  isUserAdmin = () => {
    return isAdmin({ data: this.props.user });
  };

  handleUserSelectedOnChange = () => {
    this.props.toggleSelect();
  };

  handleAdminRoleOnChange = () => {
    this.props.toggleAdmin();
  };

  handleDeleteClick = () => {
    const { authUser, user, intl } = this.props;
    const deleteMessage = intl.formatMessage(messages.userDeletionConfirmation);

    if (window.confirm(deleteMessage)) {
      if (authUser && authUser.id === user.id) {
        eventEmitter.emit<JSX.Element>(
          events.userDeletionFailed,
          <FormattedMessage {...messages.youCantDeleteYourself} />
        );
      } else {
        deleteUser(user.id).catch(() => {
          eventEmitter.emit<JSX.Element>(
            events.userDeletionFailed,
            <FormattedMessage {...messages.userDeletionFailed} />
          );
        });
      }
    }
  };

  actions: IAction[] = [
    {
      handler: () => {
        clHistory.push(`/profile/${this.props.user.attributes.slug}`);
      },
      label: this.props.intl.formatMessage(messages.seeProfile),
      icon: 'eye' as const,
    },
    {
      handler: () => {
        this.handleDeleteClick();
      },
      label: this.props.intl.formatMessage(messages.deleteUser),
      icon: 'delete' as const,
    },
  ];

  goToUserProfile = (slug: string) => (event: FormEvent) => {
    event.preventDefault();
    clHistory.push(`/profile/${slug}`);
  };

  render() {
    const { user, selected } = this.props;
    const { isAdmin } = this.state;

    return (
      <Tr
        key={user.id}
        background={selected ? colors.background : undefined}
        className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
      >
        <Td>
          <Box ml="5px">
            <Checkbox
              checked={selected}
              onChange={this.handleUserSelectedOnChange}
            />
          </Box>
        </Td>
        <Td>
          <Avatar userId={user.id} size={30} />
        </Td>
        <Td>
          {user.attributes.first_name} {user.attributes.last_name}
        </Td>
        <Td>{user.attributes.email}</Td>
        <RegisteredAt>
          {/*
            For the 'all registered users' group, we do not show invited Users who have not yet accepted their invites,
            but we do in groups they have been added to when invited.

            The 'Invitation pending' messages should clarify this.

            https://citizenlab.atlassian.net/browse/CL-2255
          */}
          {user.attributes.invite_status === 'pending' ? (
            <i>
              <FormattedMessage {...messages.userInvitationPending} />
            </i>
          ) : (
            this.state.registeredAt
          )}
        </RegisteredAt>
        <Td>
          <Toggle checked={isAdmin} onChange={this.handleAdminRoleOnChange} />
        </Td>
        <Td>
          <MoreActionsMenu showLabel={false} actions={this.actions} />
        </Td>
      </Tr>
    );
  }
}

export default injectIntl(UserTableRow);
