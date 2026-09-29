import useAuthUser from 'api/me/useAuthUser';
import useUsers from 'api/users/useUsers';

import postManagerMessages from 'components/admin/PostManager/messages';

import { useIntl } from 'utils/cl-intl';
import { getFullName } from 'utils/textUtils';

import { Option } from './OptionList';

export const UNASSIGNED = 'unassigned';

/**
 * The people an input can be assigned to: whoever can moderate the project.
 * The current user comes first, then "Unassigned", then everyone else.
 */
const useAssigneeOptions = (projectId: string) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: moderators } = useUsers({
    can_moderate_project: projectId,
    pageSize: 250,
  });

  if (!authUser || !moderators) return [];

  const others: Option[] = moderators.data
    .filter((user) => user.id !== authUser.data.id)
    .map((user) => ({ value: user.id, label: getFullName(user) }));

  return [
    {
      value: authUser.data.id,
      label: formatMessage(postManagerMessages.assignedToMe),
    },
    { value: UNASSIGNED, label: formatMessage(postManagerMessages.noOne) },
    ...others,
  ];
};

export default useAssigneeOptions;
