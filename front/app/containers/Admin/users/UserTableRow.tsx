// Libraries
import React, { useState, lazy, Suspense } from 'react';
import { isAdmin, isCollaborator } from 'services/permissions/roles';
import moment from 'moment';

// Utils
import clHistory from 'utils/cl-router/history';
import { getExceededLimitInfo } from 'components/SeatInfo/utils';

// Components
import { Tr, Td, Box } from '@citizenlab/cl2-component-library';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import Link from 'utils/cl-router/Link';
const ChangeSeatModal = lazy(() => import('./ChangeSeatModal'));

// Translation
import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import messages from './messages';
import blockUserMessages from 'components/admin/UserBlockModals/messages';

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

const StyledLink = styled(Link)`
  cursor: pointer;
  color: inherit;

  &:hover {
    color: inherit;
    text-decoration: underline;
  }
`;

interface Props {
  user: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  changeRoles: (user: IUserData, changeToNormalUser: boolean) => void;
  authUser: GetAuthUserChildProps;
}

const getStatusMessage = (user: IUserData): MessageDescriptor => {
  if (user.attributes.blocked) return blockUserMessages.blocked;
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

  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [showUnblockUserModal, setShowUnblockUserModal] = useState(false);
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });

  const [showChangeSeatModal, setShowChangeSeatModal] = useState(false);
  const [isChangingToNormalUser, setIsChangingToNormalUser] = useState(false);

  const { data: appConfiguration } = useAppConfiguration();
  const { data: seats } = useSeats();
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  const maximumAdmins =
    appConfiguration?.data.attributes.settings.core.maximum_admins_number;
  if (!appConfiguration || !seats) return null;

  const additionalAdmins =
    appConfiguration?.data.attributes.settings.core.additional_admins_number;
  const currentAdminSeats = seats.data.attributes.admins_number;
  const { hasReachedOrIsOverPlanSeatLimit } = getExceededLimitInfo(
    hasSeatBasedBillingEnabled,
    currentAdminSeats,
    additionalAdmins,
    maximumAdmins
  );

  const closeChangeSeatModal = () => {
    setShowChangeSeatModal(false);
  };
  const isBlocked = user.attributes?.blocked;

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
  const isCurrentUser = user.id === authUser?.id;
  const userBlockingRelatedActions: IAction[] =
    isUserBlockingEnabled && !isCurrentUser
      ? [
          isBlocked
            ? {
                handler: () => setShowUnblockUserModal(true),
                label: formatMessage(blockUserMessages.unblockAction),
                icon: 'user-circle' as const,
              }
            : {
                handler: () => setShowBlockUserModal(true),
                label: formatMessage(blockUserMessages.blockAction),
                icon: 'halt' as const,
              },
        ]
      : [];

  const changeRoleHandler = (changeToNormalUser: boolean) => {
    setIsChangingToNormalUser(changeToNormalUser);

    // We are showing the modal when setting to a normal user and for admins in i1 and for i2 when admin seats are being exceeded
    const shouldOpenConfirmationInModal =
      changeToNormalUser ||
      !hasSeatBasedBillingEnabled ||
      hasReachedOrIsOverPlanSeatLimit;
    if (shouldOpenConfirmationInModal) {
      setShowChangeSeatModal(true);
      return;
    }

    // We pass in the user along with whether to change that user to a normal user or admin. We are not toggling because the user passed in could have other roles or be a moderator
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
    ...userBlockingRelatedActions,
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
        <StyledLink to={`/profile/${user.attributes.slug}`}>
          {user.attributes.first_name} {user.attributes.last_name}
        </StyledLink>
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
      <BlockUser
        user={user}
        setClose={() => setShowBlockUserModal(false)}
        open={showBlockUserModal}
      />
      <UnblockUser
        user={user}
        setClose={() => setShowUnblockUserModal(false)}
        open={showUnblockUserModal}
      />
      <Suspense fallback={null}>
        <ChangeSeatModal
          userToChangeSeat={user}
          changeRoles={changeRoles}
          showModal={showChangeSeatModal}
          closeModal={closeChangeSeatModal}
          isChangingToNormalUser={isChangingToNormalUser}
        />
      </Suspense>
    </Tr>
  );
};

export default UserTableRow;
