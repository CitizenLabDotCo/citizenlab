import React from 'react';

import useCommunityMonitorProject from 'api/community_monitor/useCommunityMonitorProject';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';
const AccessRights = () => {
  const { data: project } = useCommunityMonitorProject();
  const phaseId = project?.data.relationships.current_phase?.data?.id;

  if (!phaseId) return null;

  return <ActionForms phaseId={phaseId} />;
};

export default AccessRights;
