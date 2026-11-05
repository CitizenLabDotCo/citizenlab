import React, { useState } from 'react';

import {
  Tr,
  Box,
  Td,
  Button,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import NameAvatarEmail from 'components/admin/UsersTable/NameAvatarEmail';
import UserRole from 'components/admin/UsersTable/UserRole';

import { FormattedMessage } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

interface Props {
  moderator: IUserData;
  onDeleteModerator: (userId: string) => Promise<void>;
}

const Row = ({ moderator, onDeleteModerator }: Props) => {
  const { data: authUser } = useAuthUser();
  const authUserIsAdmin = isAdmin(authUser);
  const [deleting, setDeleting] = useState(false);

  if (!authUser) return null;

  const handleDeleteModerator = async () => {
    setDeleting(true);
    await onDeleteModerator(moderator.id);
    setDeleting(false);
  };

  const authUserIsNotModerator = authUser.data.id !== moderator.id;

  // If you are an admin, you can delete yourself as moderator.
  // Otherwise, you can't.
  const showDeleteButton = authUserIsNotModerator || authUserIsAdmin;

  return (
    <Tr dataCy="moderators-table-row">
      <Td>
        <NameAvatarEmail user={moderator} />
      </Td>
      {authUserIsAdmin && (
        <Td>
          <UserRole user={moderator} />
        </Td>
      )}
      <Td>
        <InviteBadge user={moderator} />
      </Td>
      <Td>
        {showDeleteButton && (
          <Box w="100%" display="flex" justifyContent="flex-start">
            <Button
              buttonStyle="delete"
              processing={deleting}
              onClick={handleDeleteModerator}
              width="auto"
              fontSize="s"
              icon="delete"
              iconSize={`${fontSizes.base}px`}
              p="4px 8px"
              dataCy="remove-manager-button"
            >
              <FormattedMessage {...messages.removeManager} />
            </Button>
          </Box>
        )}
      </Td>
    </Tr>
  );
};

export default Row;
