// Libraries
import React, { useState } from 'react';
import { isAdmin, isCollaborator } from 'services/permissions/roles';
import moment from 'moment';

// Utils
import clHistory from 'utils/cl-router/history';
import { isNil } from 'utils/helperUtils';

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

// Hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';

const RegisteredAt = styled(Td)`
  white-space: nowrap;
`;

interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  changeRoles: (user: IUserData, changeToNormalUser: boolean) => void;
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
  changeRoles,
  authUser,
}: Props) => {
  const { formatMessage } = useIntl();

  const isUserAdmin = isAdmin({ data: user });
  const isUserCollaborator = isCollaborator({ data: user });
  const registeredAt = moment(user.attributes.registration_completed_at).format(
    'LL'
  );
  const [showModal, setShowModal] = useState(false);
  const [isChangingToNormalUser, setIsChangingToNormalUser] =
    useState<boolean>(false);

  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });
  if (!appConfiguration || !seats) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const currentAdminSeats = seats.data.attributes.admins_number;
  const hasReachedOrIsOverLimit =
    !isNil(maximumAdmins) && currentAdminSeats >= maximumAdmins;

  const closeModal = () => {
    setShowModal(false);
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

  const changeRoleHandler = (changeToNormalUser: boolean) => {
    setIsChangingToNormalUser(changeToNormalUser);

    // We are showing the modal for i1 and for i2 when seats are being exceeded
    const shouldOpenConfirmationInModal =
      !hasSeatBasedBillingEnabled || hasReachedOrIsOverLimit;
    if (shouldOpenConfirmationInModal) {
      setShowModal(true);
      return;
    }
    changeRoles(user, changeToNormalUser);
  };

  const getSeatChangeActions = () => {
    const setAsAdminAction: IAction = {
      handler: () => {
        changeRoleHandler(false);
      },
      label: formatMessage(messages.setAsAdmin),
      icon: 'shield-checkered' as const,
    };

    const setAsNormalUserAction: IAction = {
      handler: () => {
        changeRoleHandler(true);
      },
      label: formatMessage(messages.setAsNormalUser),
      icon: 'user-circle' as const,
    };

    if (isUserAdmin) {
      return [setAsNormalUserAction];
    } else if (isUserCollaborator) {
      return [setAsNormalUserAction, setAsAdminAction];
    } else {
      return [setAsAdminAction];
    }
  };

  const actions: IAction[] = [
    {
      handler: () => {
        clHistory.push(`/profile/${user.attributes.slug}`);
      },
      label: formatMessage(messages.seeProfile),
      icon: 'eye' as const,
    },
    ...getSeatChangeActions(),
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
        userToChangeSeat={user}
        changeRoles={changeRoles}
        showModal={showModal}
        closeModal={closeModal}
        isChangingToNormalUser={isChangingToNormalUser}
      />
    </Tr>
  );
};

export default UserTableRow;
