import React from 'react';
import { Select } from 'semantic-ui-react';
import { memoize } from 'lodash-es';

import { useIntl } from 'utils/cl-intl';
import messages from '../../messages';

import useUsers from 'api/users/useUsers';
import useAuthUser from 'api/me/useAuthUser';
import { IUser, IUsers } from 'api/users/types';

interface Props {
  projectId?: string;
  assigneeId: string | undefined;
  onAssigneeChange: (assigneeId: string | undefined) => void;
}

const AssigneeSelect = ({ projectId, assigneeId, onAssigneeChange }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: prospectAssignees } = useUsers({
    // If we have a projectId, we want to filter the users to only those who
    // can moderate the project. If we don't have a projectId (proposals), we want to
    // filter to only admins and mods.
    ...(typeof projectId === 'string'
      ? { can_moderate_project: projectId }
      : { can_admin: true }),
  });

  if (!prospectAssignees || !authUser) return null;

  const getAssigneeOptions = memoize(
    (prospectAssignees: IUsers, authUser: IUser) => {
      const dynamicOptions = prospectAssignees.data
        .filter((assignee) => assignee.id !== authUser.data.id)
        .map((assignee) => ({
          value: assignee.id,
          text: formatMessage(messages.assignedTo, {
            assigneeName: `${assignee.attributes.first_name} ${assignee.attributes.last_name}`,
          }),
          className: 'e2e-assignee-filter-other-user',
        }));

      // Order of assignee filter options:
      // Assigned to me > Unassigned > Assigned to X (other admins/mods)
      return [
        {
          value: authUser.data.id,
          text: formatMessage(messages.assignedToMe),
          id: 'e2e-assignee-select-assigned-to-user',
        },
        {
          value: 'unassigned',
          text: formatMessage(messages.noOne),
          id: 'e2e-assignee-select-unassigned',
        },
        ...dynamicOptions,
      ];
    }
  );

  const handleOnAssigneeChange = (
    _event: React.SyntheticEvent,
    { value }: { value?: unknown }
  ) => {
    if (typeof value === 'string') {
      onAssigneeChange(value === 'unassigned' ? undefined : value);
    }
  };

  return (
    <Select
      id={'post-row-select-assignee'}
      options={getAssigneeOptions(prospectAssignees, authUser)}
      onChange={handleOnAssigneeChange}
      value={assigneeId || 'unassigned'}
      className="fluid e2e-post-manager-post-row-assignee-select"
    />
  );
};

export default AssigneeSelect;
