import useProjectById from 'api/projects/useProjectById';
import useUpdateProject from 'api/projects/useUpdateProject';
import useUsers from 'api/users/useUsers';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

// The project stores no assignee as null; pickers need a value for it.
export const UNASSIGNED = 'unassigned';

/** The project's default assignee and the people who can be picked. */
const useProjectAssignee = (projectId: string) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: adminsAndMods } = useUsers({ can_moderate_project: projectId });
  const { mutate: updateProject } = useUpdateProject();

  const options = [
    { value: UNASSIGNED, label: formatMessage(messages.unassigned) },
    ...(adminsAndMods?.data ?? []).map((user) => ({
      value: user.id,
      label: getFullName(user),
    })),
  ];

  const assignee =
    project?.data.relationships.default_assignee?.data?.id ?? UNASSIGNED;

  const setAssignee = (value: string) => {
    if (value === assignee) return;

    updateProject({
      projectId,
      default_assignee_id: value === UNASSIGNED ? null : value,
    });
  };

  return { loaded: !!project, options, assignee, setAssignee };
};

export default useProjectAssignee;
