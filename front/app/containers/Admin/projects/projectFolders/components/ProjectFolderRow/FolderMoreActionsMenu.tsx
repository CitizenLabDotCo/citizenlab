import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import useDeleteProjectFolder from 'api/project_folders/useDeleteProjectFolder';

import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import TypedConfirmationModal from 'components/UI/TypedConfirmationModal';
import typedConfirmationMessages from 'components/UI/TypedConfirmationModal/messages';

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
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isNilOrError(authUser)) return null;
  const userCanDeleteProject = isAdmin(authUser);

  const createActions = () => {
    const actions: IAction[] = [];

    if (userCanDeleteProject) {
      actions.push({
        handler: async () => {
          setShowDeleteModal(true);
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

  const handleDeleteFolder = () => {
    setIsRunningAction && setIsRunningAction(true);
    deleteProjectFolder(
      { projectFolderId: folderId },
      {
        onSuccess: () => {
          setIsRunningAction && setIsRunningAction(false);
          setShowDeleteModal(false);
        },
        onError: () => {
          setError(formatMessage(messages.deleteFolderError));
          setIsRunningAction && setIsRunningAction(false);
          setShowDeleteModal(false);
        },
      }
    );
  };

  const handleCloseDeleteModal = () => {
    if (!isDeleteProjectFolderLoading) {
      setShowDeleteModal(false);
    }
  };

  const actions = createActions();

  if (actions) {
    return (
      <>
        <Box
          display="flex"
          alignItems="center"
          ml="1rem"
          data-testid="folderMoreActionsMenu"
        >
          <MoreActionsMenu showLabel={false} actions={actions} color={color} />
        </Box>
        <TypedConfirmationModal
          opened={showDeleteModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleDeleteFolder}
          title={messages.deleteFolderModalTitle}
          mainWarning={messages.deleteFolderModalWarning}
          confirmationWord={typedConfirmationMessages.confirmationWordDelete}
          deleteButtonText={messages.deleteFolderButton}
          isDeleting={isDeleteProjectFolderLoading}
          data-testid="delete-folder-modal"
        />
      </>
    );
  }

  return null;
};

export default FolderMoreActionsMenu;
