import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import clHistory from 'utils/cl-router/history';

const CommunityMonitor = () => {
  // NOTE: This component is only a placeholder until the tab UI is implemented.

  const { data: project } = useCommunityMonitorProject();
  const currentPhaseId = project?.data.relationships.current_phase?.data?.id;

  if (project) {
    clHistory.push(
      `/admin/projects/${project.data.id}/phases/${currentPhaseId}`
    );
  }

  return <>Community Monitor Page - WIP - Placeholder</>;
};

export default CommunityMonitor;
