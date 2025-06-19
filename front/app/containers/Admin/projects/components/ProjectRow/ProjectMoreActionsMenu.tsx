import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useCopyProject from 'api/projects/useCopyProject';
import useDeleteProject from 'api/projects/useDeleteProject';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';

import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'utils/permissions/roles';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';
import { canModerateProjectByIds } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

export type ActionType = 'deleting' | 'copying';

export interface Props {
  projectId: string;
  firstPublishedAt: string | null;
  folderId?: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (actionType: ActionType, isRunning: boolean) => void;
}

const ProjectMoreActionsMenu = ({
  projectId,
  firstPublishedAt,
  folderId,
  setError,
  setIsRunningAction,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: copyProject } = useCopyProject();

  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!authUser) {
    return null;
  }

  const userCanDeleteProject = isAdmin(authUser) || !firstPublishedAt;

  const userCanModerateProject = canModerateProjectByIds({
    projectId,
    folderId,
    user: authUser,
  });

  const userCanCopyProject =
    isAdmin(authUser) ||
    // If the user is a moderator of the project
    userCanModerateProject ||
    // If the user is a moderator of the folder
    (typeof folderId === 'string' && userModeratesFolder(authUser, folderId));

  const setLoadingState = (
    type: 'deleting' | 'copying',
    isLoading: boolean
  ) => {
    if (type === 'copying') {
      setIsCopying(isLoading);
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    } else if (type === 'deleting') {
      setIsDeleting(isLoading);
    }

    setIsRunningAction && setIsRunningAction(type, isLoading);
  };

  const createActions = () => {
    const actions: IAction[] = [];

    if (userCanCopyProject) {
      actions.push({
        handler: async () => {
          setLoadingState('copying', true);

          copyProject(projectId, {
            onSuccess: () => {
              setError(null);
              setLoadingState('deleting', false);
            },
            onError: () => {
              setError(formatMessage(messages.copyProjectError));
              setLoadingState('deleting', false);
            },
          });
        },
        label: formatMessage(messages.copyProjectButton),
        icon: 'copy' as const,
        isLoading: isCopying,
      });
    }

    if (userCanDeleteProject) {
      actions.push({
        handler: async () => {
          if (
            window.confirm(formatMessage(messages.deleteProjectConfirmation))
          ) {
            setLoadingState('deleting', true);

            deleteProject(projectId, {
              onSuccess: () => {
                setError(null);
                setLoadingState('deleting', false);
              },
              onError: () => {
                setError(formatMessage(messages.deleteProjectError));
                setLoadingState('deleting', false);
              },
            });
          }
        },
        label: formatMessage(messages.deleteProjectButtonFull),
        icon: 'delete' as const,
        isLoading: isDeleting,
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
        data-testid="moreProjectActionsMenu"
      >
        <MoreActionsMenu showLabel={false} actions={actions} />
      </Box>
    );
  }

  return null;
};

export default ProjectMoreActionsMenu;
