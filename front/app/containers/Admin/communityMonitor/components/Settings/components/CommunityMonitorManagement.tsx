import React from 'react';

import {
  Box,
  IconTooltip,
  Text,
  Title,
} from '@citizenlab/cl2-component-library';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ModeratorList from 'components/admin/ModeratorList/ModeratorList';
import UserSearch from 'components/admin/ModeratorUserSearch';
import SeatInfo from 'components/admin/SeatBasedBilling/SeatInfo';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

const CommunityMonitorManagement = () => {
  const { formatMessage } = useIntl();
  const { data: project } = useCommunityMonitorProject({});
  const projectId = project?.data.id;

  if (!projectId) return null;

  return (
    <Box mt="40px">
      <Box display="flex">
        <Title m="0px" mb="12px" color="primary" variant="h3">
          {formatMessage(messages.communityMonitorManagers)}
        </Title>
        <IconTooltip
          mt="4px"
          ml="4px"
          content={formatMessage(messages.communityMonitorManagersTooltip)}
        />
      </Box>

      <UserSearch
        projectId={projectId}
        label={
          <Text
            color="primary"
            p="0px"
            mb="0px"
            fontSize="l"
            fontWeight="semi-bold"
          >
            {formatMessage(messages.whoAreManagers)}
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
