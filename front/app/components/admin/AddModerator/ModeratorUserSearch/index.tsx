import React, { useState } from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IUserData } from 'api/users/types';

import ButtonWithLink from 'components/UI/ButtonWithLink';
import UserSelect from 'components/UI/UserSelect';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const AddButton = styled(ButtonWithLink)`
  flex-grow: 0;
  flex-shrink: 0;
  margin-left: 20px;
`;

interface Props {
  projectId?: string;
  folderId?: string;
  label?: JSX.Element | string;
  onAddModerator: (id: string) => Promise<void>;
}

const ModeratorUserSearch = ({
  projectId,
  folderId,
  label,
  onAddModerator,
}: Props) => {
  const { formatMessage } = useIntl();
  const [loading, setLoading] = useState(false);
  const [moderatorToAdd, setModeratorToAdd] = useState<IUserData | undefined>(
    undefined
  );

  const handleOnChange = (user?: IUserData) => {
    setModeratorToAdd(user);
  };

  const handleOnAddModeratorsClick = async () => {
    if (moderatorToAdd) {
      setLoading(true);
      await onAddModerator(moderatorToAdd.id);
      setModeratorToAdd(undefined);
      setLoading(false);
    }
  };

  return (
    <Box width="100%">
      {label && (
        <Box mb="0px">
          <Label htmlFor={'projectModeratorUserSearch'}>{label}</Label>
        </Box>
      )}
      <Box display="flex" alignItems="center" mb="24px">
        <Box width="500px">
          <UserSelect
            id="projectModeratorUserSearch"
            inputId="projectModeratorUserSearchInputId"
            selectedUserId={moderatorToAdd?.id || null}
            onChange={handleOnChange}
            placeholder={formatMessage(messages.searchUsers)}
            isNotProjectModeratorOfProjectId={projectId}
            isNotFolderModeratorOfFolderId={folderId}
          />
        </Box>

        <AddButton
          text={formatMessage(messages.addModerators)}
          buttonStyle="admin-dark"
          icon="plus-circle"
          padding="10px 16px"
          onClick={handleOnAddModeratorsClick}
          disabled={!moderatorToAdd}
          processing={loading}
          data-cy="e2e-add-project-moderator-button"
        />
      </Box>
    </Box>
  );
};

export default ModeratorUserSearch;
