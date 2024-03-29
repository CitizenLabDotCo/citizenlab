import React, { useState, lazy, Suspense } from 'react';

import { Tr, Td, Box, colors } from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';
import useDeleteUser from 'api/users/useDeleteUser';

import useExceedsSeats from 'hooks/useExceedsSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';

import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import blockUserMessages from 'components/admin/UserBlockModals/messages';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import Link from 'utils/cl-router/Link';
import eventEmitter from 'utils/eventEmitter';
import { isAdmin, isRegularUser } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

import events from './events';
import messages from './messages';

const ChangeSeatModal = lazy(
  () => import('components/admin/SeatBasedBilling/ChangeSeatModal')
);

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
  userInRow: IUserData;
  selected: boolean;
  toggleSelect: () => void;
  changeRoles: (user: IUserData, changeToNormalUser: boolean) => void;
  authUser: IUserData;
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
  userInRow,
  selected,
  toggleSelect,
  changeRoles,
  authUser,
}: Props) => {
  const { formatMessage } = useIntl();
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });
  const hasSeatBasedBillingEnabled = useFeatureFlag({
    name: 'seat_based_billing',
  });

  const { mutate: deleteUser } = useDeleteUser();
  const isUserInRowAdmin = isAdmin({ data: userInRow });
  const isUserInRowModerator = !isRegularUser({ data: userInRow });
  const userInRowHasRegistered =
    userInRow.attributes.invite_status !== 'pending';
  const userInRowIsCurrentUser = userInRow.id === authUser.id;

  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [showUnblockUserModal, setShowUnblockUserModal] = useState(false);
  const [showChangeSeatModal, setShowChangeSeatModal] = useState(false);
  const [isChangingToNormalUser, setIsChangingToNormalUser] = useState(false);

  const exceedsSeats = useExceedsSeats()({
    newlyAddedAdminsNumber: 1,
  });

  const closeChangeSeatModal = () => {
    setShowChangeSeatModal(false);
  };

  const isProposalsEnabled = useFeatureFlag({ name: 'initiatives' });

  const handleDeleteClick = () => {
    const baseDeleteMessage = `${formatMessage(
      messages.userDeletionConfirmation
    )}`;

    const deleteMessage = isProposalsEnabled
      ? `${baseDeleteMessage}\n\n${formatMessage(
          messages.userDeletionProposalVotes
        )}`
      : baseDeleteMessage;

    if (window.confirm(deleteMessage)) {
      if (userInRowIsCurrentUser) {
        eventEmitter.emit<JSX.Element>(
          events.userDeletionFailed,
          <FormattedMessage {...messages.youCantDeleteYourself} />
        );
      } else {
        deleteUser(userInRow.id, {
          onError: () => {
            eventEmitter.emit<JSX.Element>(
              events.userDeletionFailed,
              <FormattedMessage {...messages.userDeletionFailed} />
            );
          },
        });
      }
    }
  };

  const changeRoleHandler = (changeToNormalUser: boolean) => {
    setIsChangingToNormalUser(changeToNormalUser);

    // We are showing the modal when setting to a normal user and for admins in i1 and for i2 when admin seats are being exceeded
    const shouldOpenConfirmationInModal =
      changeToNormalUser || !hasSeatBasedBillingEnabled || exceedsSeats.admin;
    if (shouldOpenConfirmationInModal) {
      setShowChangeSeatModal(true);
      return;
    }

    // We pass in the user along with whether to change that user to a normal user or admin. We are not toggling because the user passed in could have other roles or be a moderator
    changeRoles(userInRow, changeToNormalUser);
  };

  /*
  =======
  Actions
  =======
  */
  const showProfileAction = {
    handler: () => {
      clHistory.push(`/profile/${userInRow.attributes.slug}`);
    },
    label: formatMessage(messages.seeProfile),
    icon: 'eye' as const,
  };

  const userBlockingRelatedActions: IAction[] =
    isUserBlockingEnabled && !userInRowIsCurrentUser
      ? [
          userInRow.attributes.blocked
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

  const getSeatChangeActions = () => {
    const setAsAdminAction = {
      handler: () => {
        changeRoleHandler(false);
      },
      label: formatMessage(messages.setAsAdmin),
      icon: 'shield-checkered' as const,
    };

    const setAsNormalUserAction = {
      handler: () => {
        changeRoleHandler(true);
      },
      label: formatMessage(messages.setAsNormalUser),
      icon: 'user-circle' as const,
    };

    if (isUserInRowAdmin) {
      return [setAsNormalUserAction];
    } else if (isUserInRowModerator) {
      return [setAsNormalUserAction, setAsAdminAction];
    } else {
      return [setAsAdminAction];
    }
  };

  const deleteUserAction = {
    handler: () => {
      handleDeleteClick();
    },
    label: formatMessage(messages.deleteUser),
    icon: 'delete' as const,
  };

  /*
  ===========
  Actions end
  ===========
  */

  return (
    <Tr
      key={userInRow.id}
      background={selected ? colors.background : undefined}
      className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
    >
      <Td>
        <Box ml="5px">
          <Checkbox checked={selected} onChange={toggleSelect} />
        </Box>
      </Td>
      <Td>
        <Avatar userId={userInRow.id} size={30} />
      </Td>
      <Td>
        <StyledLink to={`/profile/${userInRow.attributes.slug}`}>
          {getFullName(userInRow)}
        </StyledLink>
      </Td>
      <Td>{userInRow.attributes.email}</Td>
      <RegisteredAt>
        {/*
          For the 'all registered users' group, we do not show invited Users who have not yet accepted their invites,
          but we do in groups they have been added to when invited.

          The 'Invitation pending' messages should clarify this.

          https://citizenlab.atlassian.net/browse/CL-2255
        */}

        {userInRowHasRegistered ? (
          moment(userInRow.attributes.registration_completed_at).format('LL')
        ) : (
          <i>
            <FormattedMessage {...messages.userInvitationPending} />
          </i>
        )}
      </RegisteredAt>
      <Td>
        <FormattedMessage {...getStatusMessage(userInRow)} />
      </Td>
      <Td>
        <MoreActionsMenu
          showLabel={false}
          actions={
            userInRowHasRegistered
              ? [
                  showProfileAction,
                  ...getSeatChangeActions(),
                  deleteUserAction,
                  ...userBlockingRelatedActions,
                ]
              : [deleteUserAction]
          }
        />
      </Td>
      <BlockUser
        user={userInRow}
        setClose={() => setShowBlockUserModal(false)}
        open={showBlockUserModal}
      />
      <UnblockUser
        user={userInRow}
        setClose={() => setShowUnblockUserModal(false)}
        open={showUnblockUserModal}
      />
      <Suspense fallback={null}>
        <ChangeSeatModal
          userToChangeSeat={userInRow}
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
