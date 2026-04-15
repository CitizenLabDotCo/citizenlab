import React, { useState } from 'react';

import { Box, Button, fontSizes } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { HighestRole, IUserData } from 'api/users/types';

import blockUserMessages from 'components/admin/UserBlockModals/messages';
import Modal from 'components/UI/Modal';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';
import UserAssignedItems from './UserAssignedItems';

const ROLE_MESSAGES: Record<HighestRole, MessageDescriptor> = {
  admin: messages.platformAdmin,
  super_admin: messages.platformAdmin,
  space_moderator: messages.spaceManager,
  project_folder_moderator: messages.folderManager,
  project_moderator: messages.projectManager,
  user: messages.registeredUser,
};

const getStatusMessage = (user: IUserData): MessageDescriptor => {
  if (user.attributes.blocked) return blockUserMessages.blocked;
  const highestRole = user.attributes.highest_role ?? 'user';

  return ROLE_MESSAGES[highestRole];
};

interface Props {
  user: IUserData;
}

const UserRole = ({ user }: Props) => {
  const { data: authUser } = useAuthUser();
  const [modalOpened, setModalOpened] = useState(false);
  const authUserIsAdmin = isAdmin(authUser);

  return (
    <>
      <Box>
        <FormattedMessage {...getStatusMessage(user)} />
        {user.attributes.highest_role !== 'user' && (
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
                setModalOpened(true);
              }}
            >
              <FormattedMessage {...messages.seeAssignedItems} />
            </Button>
          </Box>
        )}
      </Box>
      <Modal
        opened={modalOpened}
        close={() => setModalOpened(false)}
        ariaLabelledBy="assigned-items-modal-title"
      >
        <UserAssignedItems user={user} />
      </Modal>
    </>
  );
};

export default UserRole;
