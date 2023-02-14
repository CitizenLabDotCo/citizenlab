import React from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import messages from './messages';
import { deleteProjectFolder } from 'services/projectFolders';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'services/permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  folderId: string;
  setError: (error: string | null) => void;
}

const FolderMoreActionsMenu = ({ folderId, setError }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  if (isNilOrError(authUser)) return null;

  const handleCallbackError = async (
    callback: () => Promise<any>,
    error: string
  ) => {
    try {
      await callback();
      setError(null);
    } catch {
      setError(error);
    }
  };

  const deleteAction = {
    handler: async () => {
      if (window.confirm(formatMessage(messages.deleteFolderConfirmation))) {
        await handleCallbackError(
          () => deleteProjectFolder(folderId),
          formatMessage(messages.deleteFolderError)
        );
      }
    },
    label: formatMessage(messages.deleteFolderButton),
    icon: 'delete' as const,
  };

  const actions: IAction[] = [];
  if (isAdmin({ data: authUser })) {
    actions.push(deleteAction);
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      ml="1rem"
      data-testid="folderMoreActionsMenu"
    >
      <MoreActionsMenu showLabel={false} actions={actions} />
    </Box>
  );
};

export default FolderMoreActionsMenu;
