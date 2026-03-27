import React, { useState } from 'react';

import {
  Tr,
  Box,
  Td,
  Button,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import InviteBadge from 'containers/Admin/invitations/all/InviteBadge';

import NameAvatarEmail from 'components/admin/UsersTable/NameAvatarEmail';
import UserRole from 'components/admin/UsersTable/UserRole';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  moderator: IUserData;
  onDeleteModerator: (userId: string) => Promise<void>;
}

const Row = ({ moderator, onDeleteModerator }: Props) => {
  const [deleting, setDeleting] = useState(false);

  const handleDeleteModerator = async () => {
    setDeleting(true);
    await onDeleteModerator(moderator.id);
    setDeleting(false);
  };

  return (
    <Tr>
      <Td>
        <NameAvatarEmail user={moderator} />
      </Td>
      <Td>
        <UserRole user={moderator} />
      </Td>
      <Td>
        <InviteBadge user={moderator} />
      </Td>
      <Td>
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
          >
            <FormattedMessage {...messages.removeModerator} />
          </Button>
        </Box>
      </Td>
    </Tr>
  );
};

export default Row;
