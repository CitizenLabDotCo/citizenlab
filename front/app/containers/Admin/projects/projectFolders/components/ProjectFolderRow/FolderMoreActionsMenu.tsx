import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

// intl
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

// api
import useDeleteProjectFolder from 'api/project_folders/useDeleteProjectFolder';
import { isAdmin } from 'utils/permissions/roles';
import useAuthUser from 'api/me/useAuthUser';

export interface Props {
  folderId: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (isLoading: boolean) => void;
}

const FolderMoreActionsMenu = ({
  folderId,
  setError,
  setIsRunningAction,
}: Props) => {
  const {
    mutate: deleteProjectFolder,
    isLoading: isDeleteProjectFolderLoading,
  } = useDeleteProjectFolder();
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  if (isNilOrError(authUser)) return null;
  const userCanDeleteProject = isAdmin(authUser);

  const createActions = () => {
    const actions: IAction[] = [];

    if (userCanDeleteProject) {
      actions.push({
        handler: async () => {
          if (
            window.confirm(formatMessage(messages.deleteFolderConfirmation))
          ) {
            setIsRunningAction && setIsRunningAction(true);
            deleteProjectFolder(
              { projectFolderId: folderId },
              {
                onError: () => {
                  setError(formatMessage(messages.deleteFolderError));
                },
              }
            );
            if (!isDeleteProjectFolderLoading) {
              setIsRunningAction && setIsRunningAction(false);
            }
          }
        },
        label: formatMessage(messages.deleteFolderButton),
        icon: 'delete' as const,
        isLoading: isDeleteProjectFolderLoading,
      });
    }

    if (actions.length > 0) {
      return actions;
    }

    return null;
  };

  const actions = createActions();

  if (actions) {
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
  }

  return null;
};

export default FolderMoreActionsMenu;
