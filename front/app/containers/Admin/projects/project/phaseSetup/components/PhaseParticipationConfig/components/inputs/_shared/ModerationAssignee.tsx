import React, { useState } from 'react';

import usePhase from 'api/phases/usePhase';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import ProjectAssignee from 'components/admin/ProjectAssignee';

import { useSearch } from 'utils/router';

interface Props {
  phaseId?: string;
}

const ModerationAssignee = ({ phaseId }: Props) => {
  const { setup_action } = useSearch({ strict: false });
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
    <ProjectAssignee
      defaultOpen={setup_action === 'moderation'}
      projectId={projectId}
      assignee={assignee}
      onAssigneeChange={setAssignee}
    />
  );
};

export default ModerationAssignee;
