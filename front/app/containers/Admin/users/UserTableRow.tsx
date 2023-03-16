// Libraries
import React, { useState } from 'react';
import { isAdmin } from 'services/permissions/roles';
import moment from 'moment';

// Utils
import clHistory from 'utils/cl-router/history';

// Components
import { Tr, Td, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import ChangeSeatModal from './ChangeSeatModal';

// Translation
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
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

const getStatusMessage = (user: IUserData): MessageDescriptor => {
  const highestRole = user.attributes.highest_role;
  const roleMessage = {
    admin: messages.platformAdmin,
    super_admin: messages.platformAdmin,
    project_folder_moderator: messages.folderManager,
    project_moderator: messages.projectManager,
    user: messages.registeredUser,
  };

  return roleMessage[highestRole];
};

const UserTableRow = ({
  user,
  selected,
  toggleSelect,
  toggleAdmin,
  authUser,
}: Props) => {
  const { formatMessage } = useIntl();

  const isUserAdmin = isAdmin({ data: user });
  const registeredAt = moment(user.attributes.registration_completed_at).format(
    'LL'
  );
  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  };

  const handleDeleteClick = () => {
    const deleteMessage = formatMessage(messages.userDeletionConfirmation);

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

  const setAsAdminAction: IAction = {
    handler: openModal,
    label: formatMessage(messages.setAsAdmin),
    icon: 'shield-checkered' as const,
  };

  const setAsNormalUserAction: IAction = {
    handler: openModal,
    label: formatMessage(messages.setAsNormalUser),
    icon: 'user-circle' as const,
  };

  const actions: IAction[] = [
    {
      handler: () => {
        clHistory.push(`/profile/${user.attributes.slug}`);
      },
      label: formatMessage(messages.seeProfile),
      icon: 'eye' as const,
    },
    ...(isUserAdmin ? [setAsNormalUserAction] : [setAsAdminAction]),
    {
      handler: () => {
        handleDeleteClick();
      },
      label: formatMessage(messages.deleteUser),
      icon: 'delete' as const,
    },
  ];

  const statusMessage = getStatusMessage(user);

  return (
    <Tr
      key={user.id}
      background={selected ? colors.background : undefined}
      className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
    >
      <Td>
        <Box ml="5px">
          <Checkbox checked={selected} onChange={toggleSelect} />
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
          registeredAt
        )}
      </RegisteredAt>
      <Td>
        <FormattedMessage {...statusMessage} />
      </Td>
      <Td>
        <MoreActionsMenu showLabel={false} actions={actions} />
      </Td>

      <ChangeSeatModal
        user={user}
        toggleAdmin={toggleAdmin}
        showModal={showModal}
        closeModal={closeModal}
      />
    </Tr>
  );
};

export default UserTableRow;
