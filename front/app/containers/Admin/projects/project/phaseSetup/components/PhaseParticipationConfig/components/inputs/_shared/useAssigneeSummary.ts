import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import useUserById from 'api/users/useUserById';

import projectAssigneeMessages from 'components/admin/ProjectAssignee/messages';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

const useAssigneeSummary = (phaseId?: string) => {
  const { formatMessage } = useIntl();
  const { data: phase } = usePhase(phaseId);
  const { data: project } = useProjectById(
    phase?.data.relationships.project.data.id
  );
  const assigneeId = project?.data.relationships.default_assignee?.data?.id;
  const { data: assignee } = useUserById(assigneeId);

  if (!project) return undefined;
  if (!assigneeId) return formatMessage(projectAssigneeMessages.unassigned);
  return assignee ? getFullName(assignee.data) : undefined;
};

export default useAssigneeSummary;
