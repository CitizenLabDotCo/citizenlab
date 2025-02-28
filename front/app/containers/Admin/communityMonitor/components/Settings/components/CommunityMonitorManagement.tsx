import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ModeratorList from 'containers/Admin/projects/project/permissions/Project/ProjectManagement/ModeratorList';
import UserSearch from 'containers/Admin/projects/project/permissions/Project/ProjectManagement/UserSearch';

import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const CommunityMonitorManagement = () => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject();
  const projectId = project?.data.id;

  if (!projectId) return null;

  return (
    <Box>
      <UserSearch
        projectId={projectId}
        label={
          <Text
            color="primary"
            p="0px"
            mb="0px"
            style={{ fontWeight: '500', fontSize: '18px' }}
          >
            {formatMessage(messages.communityMonitorManagers)}
          </Text>
        }
      />
      <ModeratorList projectId={projectId} />
      <Box width="516px">
        <SeatInfo seatType="moderator" />
      </Box>
    </Box>
  );
};

export default CommunityMonitorManagement;
