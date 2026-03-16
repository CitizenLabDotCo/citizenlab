import React, { useState, Suspense, useRef, useMemo, useCallback } from 'react';

import {
  Tr,
  Td,
  colors,
  Box,
  Text,
  Button,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';

import useExceedsSeats from 'hooks/useExceedsSeats';
import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import ChangeSeatModal from 'components/admin/SeatBasedBilling/ChangeSeatModal';
import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import blockUserMessages from 'components/admin/UserBlockModals/messages';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import DeleteUser from 'components/admin/UserDeleteModal';
import Avatar from 'components/Avatar';
import Checkbox from 'components/UI/Checkbox';
import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { timeAgo } from 'utils/dateUtils';
import { isAdmin } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

import messages from '../../../../messages';

import { getActions } from './actions';
import SetAsModerator from './SetAsModerator';
import UserAssignedItems from './UserAssignedItems';

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

export type ChangingRoleTypes = 'admin' | 'moderator' | 'user';

const getStatusMessage = (user: IUserData): MessageDescriptor => {
  if (user.attributes.blocked) return blockUserMessages.blocked;
  const highestRole = user.attributes.highest_role ?? 'user';
  const roleMessage = {
    admin: messages.platformAdmin,
    super_admin: messages.platformAdmin,
    project_folder_moderator: messages.folderManager,
    project_moderator: messages.projectManager,
    user: messages.registeredUser,
  };

  return roleMessage[highestRole];
};

const UsersTableRow = ({
  userInRow,
  selected,
  toggleSelect,
  changeRoles,
  authUser,
}: Props) => {
  const moreActionsButtonRef = useRef<HTMLButtonElement>(null);
  const [isAssignedItemsOpened, setIsAssignedItemsOpened] = useState(false);
  const [setAsModeratorOpened, setSetAsModeratorOpened] = useState(false);
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const isUserBlockingEnabled = useFeatureFlag({
    name: 'user_blocking',
  });

  const userInRowHasRegistered =
    userInRow.attributes.invite_status !== 'pending';
  const authUserIsAdmin = isAdmin({ data: authUser });

  const [showBlockUserModal, setShowBlockUserModal] = useState(false);
  const [showUnblockUserModal, setShowUnblockUserModal] = useState(false);
  const [showDeleteUserModal, setShowDeleteUserModal] = useState(false);
  const [showChangeSeatModal, setShowChangeSeatModal] = useState(false);
  const [changingToRoleType, setChangingToRoleType] =
    useState<ChangingRoleTypes>('admin');

  const exceedsSeatsAdmin = useExceedsSeats()({
    newlyAddedAdminsNumber: 1,
  });

  const exceedsSeatsModerator = useExceedsSeats()({
    newlyAddedModeratorsNumber: 1,
  });

  const closeChangeSeatModal = () => {
    setShowChangeSeatModal(false);
  };

  const changeRoleHandler = useCallback(
    (changingToRoleType: ChangingRoleTypes) => {
      setChangingToRoleType(changingToRoleType);
      const changeToNormalUser = changingToRoleType === 'user';

      const showModalForAdmin =
        changingToRoleType === 'admin' && exceedsSeatsAdmin.admin;
      const showModalForModerator =
        changingToRoleType === 'moderator' && exceedsSeatsModerator.moderator;

      const shouldOpenConfirmationInModal =
        changeToNormalUser || showModalForAdmin || showModalForModerator;

      if (shouldOpenConfirmationInModal) {
        setShowChangeSeatModal(true);
        return;
      }

      // If the user is changing to moderator, we want to bypass calling the changeRoles function because the role change is handled in the SetAsProjectModerator modal
      if (changingToRoleType === 'moderator') {
        return;
      }

      // We pass in the user along with whether to change that user to a normal user or admin. We are not toggling because the user passed in could have other roles or be a moderator
      changeRoles(userInRow, changeToNormalUser);
    },
    [userInRow, changeRoles, exceedsSeatsAdmin, exceedsSeatsModerator]
  );

  const actions = useMemo(() => {
    return getActions({
      formatMessage,
      user: userInRow,
      authUser,
      isUserBlockingEnabled,
      setShowUnblockUserModal,
      setShowBlockUserModal,
      setShowDeleteUserModal,
      setSetAsModeratorOpened,
      changeRoleHandler,
    });
  }, [
    formatMessage,
    userInRow,
    authUser,
    isUserBlockingEnabled,
    setShowUnblockUserModal,
    setShowBlockUserModal,
    setShowDeleteUserModal,
    setSetAsModeratorOpened,
    changeRoleHandler,
  ]);

  return (
    <>
      <Tr
        key={userInRow.id}
        background={selected ? colors.background : undefined}
        className={`e2e-user-table-row ${selected ? 'selected' : ''}`}
      >
        <Td>
          <Checkbox checked={selected} onChange={toggleSelect} />
        </Td>
        <Td>
          <Box display="flex" alignItems="center" gap="8px">
            <Avatar userId={userInRow.id} size={30} />
            <Box>
              <StyledLink to={`/profile/${userInRow.attributes.slug}`}>
                {getFullName(userInRow)}
              </StyledLink>
              <Text fontSize="s" m="0px" color="textSecondary">
                {userInRow.attributes.email}
              </Text>
            </Box>
          </Box>
        </Td>
        <Td>
          <FormattedMessage {...getStatusMessage(userInRow)} />
          {userInRow.attributes.highest_role !== 'user' && (
            <Box display="flex">
              <Button
                buttonStyle="text"
                icon="chevron-down"
                iconPos="right"
                fontSize={`${fontSizes.s}px`}
                p="0px"
                iconSize="18px"
                disabled={!authUserIsAdmin}
                onClick={() => {
                  setIsAssignedItemsOpened(true);
                }}
              >
                <FormattedMessage {...messages.seeAssignedItems} />
              </Button>
            </Box>
          )}
        </Td>
        <Td>
          {userInRow.attributes.last_active_at &&
            timeAgo(Date.parse(userInRow.attributes.last_active_at), locale)}
        </Td>
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
          <MoreActionsMenu
            showLabel={false}
            ref={moreActionsButtonRef}
            actions={actions}
          />
        </Td>
        {showBlockUserModal && (
          <BlockUser
            user={userInRow}
            setClose={() => setShowBlockUserModal(false)}
            returnFocusRef={moreActionsButtonRef}
          />
        )}
        {showUnblockUserModal && (
          <UnblockUser
            user={userInRow}
            setClose={() => setShowUnblockUserModal(false)}
            returnFocusRef={moreActionsButtonRef}
          />
        )}
        {showDeleteUserModal && (
          <DeleteUser
            user={userInRow}
            setClose={() => setShowDeleteUserModal(false)}
            returnFocusRef={moreActionsButtonRef}
          />
        )}
        <Suspense fallback={null}>
          <ChangeSeatModal
            userToChangeSeat={userInRow}
            showModal={showChangeSeatModal}
            returnFocusRef={moreActionsButtonRef}
            changingToRoleType={changingToRoleType}
            closeModal={closeChangeSeatModal}
            onConfirm={() => changeRoleHandler(changingToRoleType)}
          />
        </Suspense>
        <Modal
          opened={isAssignedItemsOpened}
          close={() => setIsAssignedItemsOpened(false)}
          // Return focus to the More Actions button on close
          returnFocusRef={moreActionsButtonRef}
          ariaLabelledBy="assigned-items-modal-title"
        >
          <UserAssignedItems user={userInRow} />
        </Modal>
        <Modal
          opened={setAsModeratorOpened}
          close={() => setSetAsModeratorOpened(false)}
          // Return focus to the More Actions button on close
          returnFocusRef={moreActionsButtonRef}
          ariaLabelledBy="set-moderator-modal-title"
        >
          <SetAsModerator
            user={userInRow}
            onClose={() => setSetAsModeratorOpened(false)}
            onSuccess={() => changeRoleHandler('moderator')}
          />
        </Modal>
      </Tr>
    </>
  );
};

export default UsersTableRow;
