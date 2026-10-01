import useAuthUser from 'api/me/useAuthUser';
import { IUserData } from 'api/users/types';
import useUsers from 'api/users/useUsers';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export const UNASSIGNED = 'unassigned';

const useAssigneeOptions = (
  projectId: string | undefined,
  otherLabel: (user: IUserData) => string
) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: prospectAssignees } = useUsers({
    // Proposals have no project, so any admin can take them.
    ...(projectId
      ? { can_moderate_project: projectId }
      : { admins_only: true }),
    pageSize: 250,
  });

  if (!authUser || !prospectAssignees) return [];

  return [
    { value: authUser.data.id, label: formatMessage(messages.assignedToMe) },
    { value: UNASSIGNED, label: formatMessage(messages.noOne) },
    ...prospectAssignees.data
      .filter((user) => user.id !== authUser.data.id)
      .map((user) => ({ value: user.id, label: otherLabel(user) })),
  ];
};

export default useAssigneeOptions;
