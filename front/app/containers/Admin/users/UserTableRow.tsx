// Libraries
import React, { useEffect, useState } from 'react';
import { isAdmin } from 'services/permissions/roles';
import moment from 'moment';

// Utils
import clHistory from 'utils/cl-router/history';

// Components
import { Tr, Td, Box, Button, Text } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import Modal from 'components/UI/Modal';
import SeatInfo from 'components/SeatInfo';

// Translation
import { FormattedMessage, useIntl } from 'utils/cl-intl';
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

// hooks
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useSeats from 'api/seats/useSeats';

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

const getStatusMessage = (user: IUserData) => {
  const highestRole = user.attributes.highest_role;
  let statusMessage = messages.registeredUser;
  if (['admin', 'super_admin'].includes(highestRole)) {
    statusMessage = messages.platformAdmin;
  } else if (highestRole === 'project_folder_moderator') {
    statusMessage = messages.folderAdmin;
  } else if (highestRole === 'project_moderator') {
    statusMessage = messages.projectManager;
  }
  return statusMessage;
};

const getInfoText = (
  isUserAdmin: boolean,
  maximumAdmins: number,
  currentAdminSeats: number
) => {
  if (isUserAdmin) {
    return messages.confirmNormalUserQuestion;
  }

  let confirmChangeQuestion = messages.confirmAdminQuestion;

  if (maximumAdmins === currentAdminSeats) {
    confirmChangeQuestion = messages.reachedLimitMessage;
  } else if (currentAdminSeats > maximumAdmins) {
    confirmChangeQuestion = messages.permissionToBuy;
  }

  return confirmChangeQuestion;
};

const getButtonText = (
  isUserAdmin: boolean,
  maximumAdmins: number,
  currentAdminSeats: number
) => {
  let buttonText = messages.confirm;

  if (isUserAdmin) {
    return buttonText;
  }

  return currentAdminSeats >= maximumAdmins
    ? messages.buyAditionalSeat
    : buttonText;
};

const UserTableRow = ({
  user,
  selected,
  toggleSelect,
  toggleAdmin,
  authUser,
}: Props) => {
  const { formatMessage } = useIntl();
  const [isUserAdmin, setUserIsAdmin] = useState(isAdmin({ data: user }));
  const [registeredAt, setRegisteredAt] = useState(
    moment(user.attributes.registration_completed_at).format('LL')
  );
  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();

  const [showModal, setShowModal] = useState(false);
  const closeModal = () => {
    setShowModal(false);
  };
  const openModal = () => {
    setShowModal(true);
  };

  useEffect(() => {
    setUserIsAdmin(isAdmin({ data: user }));
    setRegisteredAt(
      moment(user.attributes.registration_completed_at).format('LL')
    );
  }, [user]);

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
    handler: () => {
      openModal();
      // Show set as admin modal
    },
    label: formatMessage(messages.setAsAdmin),
    icon: 'shield-checkered' as const,
  };

  const setAsNormalUserAction: IAction = {
    handler: () => {
      openModal();
      // Show set as normal user modal
    },
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

  if (!appConfiguration || !seats) return null;

  const maximumAdmins =
    appConfiguration.data.attributes.settings.core.maximum_admins_number;
  const currentAdminSeats = seats.data.attributes.admins_number;

  const confirmChangeQuestion = getInfoText(
    isUserAdmin,
    maximumAdmins,
    currentAdminSeats
  );
  const modalTitle = isUserAdmin
    ? messages.setAsNormalUser
    : messages.giveAdminRights;
  const statusMessage = getStatusMessage(user);
  const buttonText = getButtonText(
    isUserAdmin,
    maximumAdmins,
    currentAdminSeats
  );

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

      <Modal
        opened={showModal}
        close={closeModal}
        header={
          <Box px="2px">
            <Text color="primary" my="8px" fontSize="l" fontWeight="bold">
              {formatMessage(modalTitle)}
            </Text>
          </Box>
        }
      >
        <Box display="flex" flexDirection="column" width="100%" p="32px">
          <Box>
            <Text color="textPrimary" fontSize="m" my="0px">
              <FormattedMessage
                {...confirmChangeQuestion}
                values={{
                  name: (
                    <Text as="span" fontWeight="bold" fontSize="m">
                      {`${user.attributes.first_name} ${user.attributes.last_name}`}
                    </Text>
                  ),
                }}
              />
            </Text>
            <Box py="32px">
              <SeatInfo seatType="admin" width={null} />
            </Box>
          </Box>
          <Box
            display="flex"
            flexDirection="row"
            width="100%"
            alignItems="center"
          >
            <Button
              width="auto"
              onClick={() => {
                toggleAdmin();
                closeModal();
              }}
            >
              {formatMessage(buttonText)}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Tr>
  );
};

export default UserTableRow;
