import React from 'react';
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

  const copyAction = {
    handler: async () => {
      await handleCallbackError(
        () => copyProject(projectId),
        formatMessage(messages.copyProjectError)
      );
    },
    label: formatMessage(messages.copyProjectButton),
    icon: 'copy' as const,
  };

  const deleteAction = {
    handler: async () => {
      if (window.confirm(formatMessage(messages.deleteProjectConfirmation))) {
        await handleCallbackError(
          () => deleteProject(projectId),
          formatMessage(messages.deleteProjectError)
        );
      }
    },
    label: formatMessage(messages.deleteProjectButtonFull),
    icon: 'delete' as const,
  };

  const actions: IAction[] = [copyAction];
  if (isAdmin({ data: authUser })) {
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
