import React from 'react';

import { Box, IconTooltip, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useAuthUser from 'api/me/useAuthUser';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';
import useDeleteProjectModerator from 'api/project_moderators/useDeleteProjectModerator';
import useProjectModerators from 'api/project_moderators/useProjectModerators';

import AddModerator from 'components/admin/AddModerator';
import ModeratorsTable from 'components/admin/ModeratorsTable';

import { useIntl } from 'utils/cl-intl';
import { isProjectModerator } from 'utils/permissions/roles';

import messages from '../messages';

const CommunityMonitorManagement = () => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject({});
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const projectId = project?.data.id;
  const { data: projectModerators } = useProjectModerators({ projectId });
  const { mutateAsync: deleteProjectModerator } = useDeleteProjectModerator();
  const { data: authUser } = useAuthUser();
  const userIsProjectModerator = isProjectModerator(authUser);

  if (!projectId) return null;

  const handleDeleteModerator = userIsProjectModerator
    ? undefined
    : async (userId: string) => {
        await deleteProjectModerator({ projectId, userId });
      };

  return (
    <Box mt="40px">
      <Box display="flex">
        <Title m="0px" mb="32px" color="primary" variant="h3">
          {formatMessage(messages.communityMonitorManagers)}
        </Title>
        <IconTooltip
          mt="4px"
          ml="4px"
          content={formatMessage(messages.communityMonitorManagersTooltip)}
        />
      </Box>
      <AddModerator
        projectId={projectId}
        onAddModerator={async (params) => {
          await addProjectModerator({ ...params, projectId });
        }}
      />
      {projectModerators && (
        <Box mt="20px">
          <ModeratorsTable
            moderators={projectModerators.data}
            onDeleteModerator={handleDeleteModerator}
          />
        </Box>
      )}
    </Box>
  );
};

export default CommunityMonitorManagement;
