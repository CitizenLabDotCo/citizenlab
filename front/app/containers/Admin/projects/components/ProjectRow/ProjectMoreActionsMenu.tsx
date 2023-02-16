import React, { useState } from 'react';
import { Box } from '@citizenlab/cl2-component-library';
import messages from '../messages';
import { copyProject, deleteProject } from 'services/projects';
import MoreActionsMenu, { IAction } from 'components/UI/MoreActionsMenu';
import { useIntl } from 'utils/cl-intl';
import { isAdmin } from 'services/permissions/roles';
import useAuthUser from 'hooks/useAuthUser';
import { isNilOrError } from 'utils/helperUtils';

export interface Props {
  projectId: string;
  setError: (error: string | null) => void;
}

const ProjectMoreActionsMenu = ({ projectId, setError }: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const isAdminUser = isAdmin({ data: authUser });
  const [isCopying, setIsCopying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
  const actions: IAction[] = [
    {
      handler: async () => {
        setIsCopying(true);
        await handleCallbackError(
          () => copyProject(projectId),
          formatMessage(messages.copyProjectError)
        );
        setIsCopying(false);
      },
      label: formatMessage(messages.copyProjectButton),
      icon: 'copy' as const,
      isLoading: isCopying,
    },
  ];

  if (isAdminUser) {
    actions.push({
      handler: async () => {
        if (window.confirm(formatMessage(messages.deleteProjectConfirmation))) {
          setIsDeleting(true);
          await handleCallbackError(
            () => deleteProject(projectId),
            formatMessage(messages.deleteProjectError)
          );
          setIsDeleting(false);
        }
      },
      label: formatMessage(messages.deleteProjectButtonFull),
      icon: 'delete' as const,
      isLoading: isDeleting,
    });
  }

  if (actions.length > 0) {
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
