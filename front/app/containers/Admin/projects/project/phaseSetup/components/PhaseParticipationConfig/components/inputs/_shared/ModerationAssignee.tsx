import React, { useState } from 'react';

import usePhase from 'api/phases/usePhase';
import useUpdateProject from 'api/projects/useUpdateProject';

import { useRegisterPageSaver } from 'components/admin/PageSaveContext';
import ProjectAssignee from 'components/admin/ProjectAssignee';

import { removeSearchParams } from 'utils/cl-router/removeSearchParams';
import { useParams, useSearch } from 'utils/router';

interface Props {
  phaseId?: string;
}

const ModerationAssignee = ({ phaseId }: Props) => {
  const { setup_action } = useSearch({ strict: false });
  // The assignee belongs to the project, so a phase not saved yet can set it too.
  const { projectId: routeProjectId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const { mutateAsync: updateProject } = useUpdateProject();
  const [assignee, setAssignee] = useState<string | null | undefined>();
  const projectId =
    phase?.data.relationships.project.data.id ?? (phaseId ? undefined : routeProjectId);

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
      onClose={() => {
        if (setup_action === 'moderation') removeSearchParams(['setup_action']);
      }}
      projectId={projectId}
      assignee={assignee}
      onAssigneeChange={setAssignee}
    />
  );
};

export default ModerationAssignee;
