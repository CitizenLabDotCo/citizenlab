import useProjectById from 'api/projects/useProjectById';
import useUsers from 'api/users/useUsers';

import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import messages from './messages';

const useProjectAssignee = (projectId: string) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: adminsAndMods } = useUsers({ can_moderate_project: projectId });

  const options = [
    { value: UNASSIGNED, label: formatMessage(messages.unassigned) },
    ...(adminsAndMods?.data ?? []).map((user) => ({
      value: user.id,
      label: getFullName(user),
    })),
  ];

  const savedAssignee =
    project?.data.relationships.default_assignee?.data?.id ?? null;

  return { loaded: !!project, options, savedAssignee };
};

export default useProjectAssignee;
