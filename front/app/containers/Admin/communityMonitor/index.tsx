import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import clHistory from 'utils/cl-router/history';

const CommunityMonitor = () => {
  const { data: project } = useCommunityMonitorProject();

  if (project) {
    clHistory.push(`/admin/projects/${project.data.id}`);
  }

  return <>Community Monitor - WIP</>;
};

export default CommunityMonitor;
