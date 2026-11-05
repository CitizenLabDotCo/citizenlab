import React from 'react';

import usePhase from 'api/phases/usePhase';

import Outlet from 'components/Outlet';

interface Props {
  phaseId?: string;
}

const ModerationAssignee = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);

  if (!phase) return null;

  return (
    <Outlet
      id="app.containers.Admin.projects.phase.moderation"
      projectId={phase.data.relationships.project.data.id}
    />
  );
};

export default ModerationAssignee;
