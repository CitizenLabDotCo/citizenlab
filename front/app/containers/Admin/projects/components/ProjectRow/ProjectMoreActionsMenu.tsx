import React, { useState } from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { copyProject, deleteProject } from 'services/projects';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'services/permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';
import { canModerateProject } from 'services/permissions/rules/projectPermissions';

export interface Props {
  projectId: string;
  setError: (error: string | null) => void;
  setIsRunningAction?: (isLoading: boolean) => void;
}

const ProjectMoreActionsMenu = ({
  projectId,
  setError,
  setIsRunningAction,
}: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
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

  const setLoadingState = (
    type: 'deleting' | 'copying',
    isLoading: boolean
  ) => {
    if (type === 'copying') {
      setIsCopying(isLoading);
    } else if (type === 'deleting') {
      setIsDeleting(isLoading);
    }

    setIsRunningAction && setIsRunningAction(isLoading);
  };

  const copyAction = {
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
  };

  const deleteAction = {
    handler: async () => {
      if (window.confirm(formatMessage(messages.deleteProjectConfirmation))) {
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
  };

  const actions: IAction[] = [];
  const canModerate = canModerateProject(projectId, { data: authUser });
  const isAdminUser = isAdmin({ data: authUser });

  if (isAdminUser || canModerate) {
    actions.push(copyAction);
  }

  if (isAdminUser) {
    actions.push(deleteAction);
  }

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
};

export default ProjectMoreActionsMenu;
