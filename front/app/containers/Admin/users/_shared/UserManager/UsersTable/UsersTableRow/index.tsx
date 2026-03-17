import React, { useState, useRef, useMemo, useCallback } from 'react';

import {
  Tr,
  Td,
  colors,
  Box,
  Text,
  Button,
  fontSizes,
  Checkbox,
} from '@citizenlab/cl2-component-library';
import moment from 'moment';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';
import useUpdateUser from 'api/users/useUpdateUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';

import BlockUser from 'components/admin/UserBlockModals/BlockUser';
import blockUserMessages from 'components/admin/UserBlockModals/messages';
import UnblockUser from 'components/admin/UserBlockModals/UnblockUser';
import DeleteUser from 'components/admin/UserDeleteModal';
import Avatar from 'components/Avatar';
import Modal from 'components/UI/Modal';
import MoreActionsMenu from 'components/UI/MoreActionsMenu';

import { FormattedMessage, MessageDescriptor, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { timeAgo } from 'utils/dateUtils';
import { isAdmin } from 'utils/permissions/roles';
import { getFullName } from 'utils/textUtils';

import messages from '../../../../messages';

import { Action, getActions } from './actions';
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
  authUser: IUserData;
  toggleSelect: () => void;
}

export type ChangingRoleType = 'admin' | 'moderator' | 'user';

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
  authUser,
  toggleSelect,
}: Props) => {
  const { mutate: updateUser } = useUpdateUser();
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

  const handleMakeAdmin = useCallback(() => {
    updateUser({
      userId: userInRow.id,
      roles: [...(userInRow.attributes.roles ?? []), { type: 'admin' }],
    });
  }, [userInRow, updateUser]);

  const onAction = useCallback(
    (action: Action) => {
      switch (action) {
        case 'block-user':
          setShowBlockUserModal(true);
          break;
        case 'unblock-user':
          setShowUnblockUserModal(true);
          break;
        case 'delete-user':
          setShowDeleteUserModal(true);
          break;
        case 'set-admin':
          // TODO
          handleMakeAdmin();
          break;
        case 'set-moderator':
          setSetAsModeratorOpened(true);
          break;
        case 'set-normal-user':
          updateUser({
            userId: userInRow.id,
            roles: [],
          });
          break;
        default:
          break;
      }
    },
    [handleMakeAdmin, updateUser, userInRow]
  );

  const actions = useMemo(() => {
    return getActions({
      formatMessage,
      user: userInRow,
      authUser,
      isUserBlockingEnabled,
      onAction,
    });
  }, [formatMessage, userInRow, authUser, isUserBlockingEnabled, onAction]);

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
          />
        </Modal>
      </Tr>
    </>
  );
};

export default UsersTableRow;
