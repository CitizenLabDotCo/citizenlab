import React, { useState } from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { copyProject, deleteProject } from 'services/projects';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'services/permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import useProjectById from 'api/projects/useProjectById';
import { userModeratesFolder } from 'services/permissions/rules/projectFolderPermissions';

export type ActionType = 'deleting' | 'copying';

export interface Props {
  projectId: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (actionType: ActionType, isRunning: boolean) => void;
}

const ProjectMoreActionsMenu = ({
  projectId,
  setError,
  setIsRunningAction,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const folderId = project?.data.attributes.folder_id;
  const authUser = useAuthUser();
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (isNilOrError(authUser)) {
    return null;
  }

  const userCanDeleteProject = isAdmin({ data: authUser });
  const userCanCopyProject =
    isAdmin({ data: authUser }) ||
    // If folderId is string, it means project is in a folder
    (typeof folderId === 'string' && userModeratesFolder(authUser, folderId));

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

  const setLoadingState = (
    type: 'deleting' | 'copying',
    isLoading: boolean
  ) => {
    if (type === 'copying') {
      setIsCopying(isLoading);
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
          await handleCallbackError(
            () => copyProject(projectId),
            formatMessage(messages.copyProjectError)
          );
          setLoadingState('copying', false);
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
            await handleCallbackError(
              () => deleteProject(projectId),
              formatMessage(messages.deleteProjectError)
            );
            setLoadingState('deleting', false);
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
