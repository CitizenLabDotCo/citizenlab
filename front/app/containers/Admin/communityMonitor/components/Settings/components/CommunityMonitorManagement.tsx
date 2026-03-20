import React from 'react';

import { Box, IconTooltip, Title } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';
import useAddProjectModerator from 'api/project_moderators/useAddProjectModerator';

import AddModerator from 'components/admin/AddModerator';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const CommunityMonitorManagement = () => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject({});
  const { mutateAsync: addProjectModerator } = useAddProjectModerator();
  const projectId = project?.data.id;

  if (!projectId) return null;

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
    </Box>
  );
};

export default CommunityMonitorManagement;
