import React, { useState } from 'react';

import usePhase from 'api/phases/usePhase';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import Outlet from 'components/Outlet';

interface Props {
  phaseId?: string;
}

const ModerationAssignee = ({ phaseId }: Props) => {
  const { data: phase } = usePhase(phaseId);
  const { mutateAsync: updateProject } = useUpdateProject();
  const [assignee, setAssignee] = useState<string | null | undefined>();
  const projectId = phase?.data.relationships.project.data.id;

  useRegisterPageSaver('assignee', {
    dirty: assignee !== undefined,
    save: async () => {
      if (!projectId || assignee === undefined) return;
      await updateProject({ projectId, default_assignee_id: assignee });
      setAssignee(undefined);
    },
  });

  if (!projectId) return null;

  return (
    <Outlet
      id="app.containers.Admin.projects.phase.moderation"
      projectId={projectId}
      assignee={assignee}
      onAssigneeChange={setAssignee}
    />
  );
};

export default ModerationAssignee;
