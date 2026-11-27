import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useCopyProject from 'api/projects/useCopyProject';
import useDeleteProject from 'api/projects/useDeleteProject';
import { isCopyInProgressError } from 'api/projects/utils';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import TypedDeleteConfirmationModal from 'components/UI/TypedDeleteConfirmationModal';
import typedDeleteConfirmationMessages from 'components/UI/TypedDeleteConfirmationModal/messages';

import { useIntl } from 'utils/cl-intl';
import { isAdmin, isSpaceModerator } from 'utils/permissions/roles';
import { userModeratesFolder } from 'utils/permissions/rules/projectFolderPermissions';
import { canModerateProjectByIds } from 'utils/permissions/rules/projectPermissions';

import messages from '../messages';

export type ActionType = 'deleting' | 'copying';

export interface Props {
  projectId: string;
  projectName: string;
  firstPublishedAt: string | null;
  folderId?: string;
  color?: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (actionType: ActionType, isRunning: boolean) => void;
}

const ProjectMoreActionsMenu = ({
  projectId,
  projectName,
  firstPublishedAt,
  folderId,
  color,
  setError,
  setIsRunningAction,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: copyProject, isPending: isCopying } = useCopyProject();

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (!authUser) {
    return null;
  }

  const userIsSpaceModerator = isSpaceModerator(authUser);

  const userCanDeleteProject =
    isAdmin(authUser) || userIsSpaceModerator || !firstPublishedAt;

  const userCanModerateProject = canModerateProjectByIds({
    projectId,
    folderId,
    user: authUser,
  });

  const userCanCopyProject =
    isAdmin(authUser) ||
    userIsSpaceModerator ||
    // If the user is a moderator of the project
    userCanModerateProject ||
    // If the user is a moderator of the folder
    (typeof folderId === 'string' && userModeratesFolder(authUser, folderId));

  const setLoadingState = (type: ActionType, isLoading: boolean) => {
    if (type === 'deleting') {
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
              setLoadingState('copying', false);
            },
            onError: (error) => {
              setError(
                formatMessage(
                  isCopyInProgressError(error)
                    ? messages.copyProjectInProgressError
                    : messages.copyProjectError
                )
              );
              setLoadingState('copying', false);
            },
          });
        },
        label: formatMessage(
          isCopying ? messages.copyingProject : messages.copyProjectButton
        ),
        icon: 'copy' as const,
        isLoading: isCopying,
        // The menu closes as soon as the copy starts, so it can be reopened
        // and clicked again before the first copy is done.
        disabled: isCopying,
      });
    }

    if (userCanDeleteProject) {
      actions.push({
        handler: async () => {
          setShowDeleteModal(true);
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

  const handleDeleteProject = () => {
    setLoadingState('deleting', true);

    deleteProject(projectId, {
      onSuccess: () => {
        setError(null);
        setLoadingState('deleting', false);
        setShowDeleteModal(false);
      },
      onError: () => {
        setError(formatMessage(messages.deleteProjectError));
        setLoadingState('deleting', false);
        setShowDeleteModal(false);
      },
    });
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleting) {
      setShowDeleteModal(false);
    }
  };

  if (actions) {
    return (
      <>
        <Box
          display="flex"
          alignItems="center"
          ml="1rem"
          data-testid="moreProjectActionsMenu"
        >
          <MoreActionsMenu showLabel={false} actions={actions} color={color} />
        </Box>
        <TypedDeleteConfirmationModal
          opened={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteProject}
          title={messages.deleteProjectModalTitle}
          entityName={projectName}
          mainWarning={messages.deleteProjectModalWarning}
          confirmationWord={
            typedDeleteConfirmationMessages.confirmationWordDelete
          }
          deleteButtonText={messages.deleteProjectButtonFull}
          isDeleting={isDeleting}
        />
      </>
    );
  }

  return null;
};

export default ProjectMoreActionsMenu;
