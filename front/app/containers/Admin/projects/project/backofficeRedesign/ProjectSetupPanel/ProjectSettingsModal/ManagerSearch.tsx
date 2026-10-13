import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { IUserData } from 'api/users/types';

import messages from 'components/admin/AddModerator/ModeratorUserSearch/messages';
import UserSelect from 'components/UI/UserSelect';

import { useIntl } from 'utils/cl-intl';

import { MANAGER_ACTION_MIN_WIDTH } from './constants';

interface Props {
  projectId: string;
  onAdd: (userId: string) => Promise<void>;
}

const ManagerSearch = ({ projectId, onAdd }: Props) => {
  const { formatMessage } = useIntl();
  const [user, setUser] = useState<IUserData | undefined>(undefined);
  const [processing, setProcessing] = useState(false);

  const handleAdd = async () => {
    if (!user) return;

    setProcessing(true);
    await onAdd(user.id);
    setUser(undefined);
    setProcessing(false);
  };

  return (
    <Box display="flex" alignItems="center" gap="8px">
      <Box flex="1" minWidth="0">
        <UserSelect
          variant="bo"
          id="projectModeratorUserSearch"
          inputId="projectModeratorUserSearchInputId"
          selectedUserId={user?.id ?? null}
          onChange={setUser}
          placeholder={formatMessage(messages.searchUsers)}
          isNotProjectModeratorOfProjectId={projectId}
        />
      </Box>
      <Button
        buttonStyle="bo-secondary"
        width="auto"
        minWidth={MANAGER_ACTION_MIN_WIDTH}
        onClick={handleAdd}
        disabled={!user}
        processing={processing}
      >
        {formatMessage(messages.addModerators)}
      </Button>
    </Box>
  );
};

export default ManagerSearch;
