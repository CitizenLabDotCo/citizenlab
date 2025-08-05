import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useDeleteProjectFolder from 'api/project_folders/useDeleteProjectFolder';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';

import messages from './messages';

export interface Props {
  folderId: string;
  color?: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (isLoading: boolean) => void;
}

const FolderMoreActionsMenu = ({
  folderId,
  color,
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
        <MoreActionsMenu showLabel={false} actions={actions} color={color} />
      </Box>
    );
  }

  return null;
};

export default FolderMoreActionsMenu;
