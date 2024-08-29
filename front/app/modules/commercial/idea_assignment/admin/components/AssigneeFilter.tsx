import React, { SyntheticEvent } from 'react';

// import { Select } from '@citizenlab/cl2-component-library';
import { Dropdown } from 'semantic-ui-react';

import useAuthUser from 'api/me/useAuthUser';
import { IUsers } from 'api/users/types';
import useUsers from 'api/users/useUsers';

import { ManagerType } from 'components/admin/PostManager';
import postManagerMessages from 'components/admin/PostManager/messages';

import { trackEventByName } from 'utils/analytics';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { getFullName } from 'utils/textUtils';

import messages from './messages';
import tracks from './tracks';

interface Props {
  handleAssigneeFilterChange: (value: string | undefined) => void;
  projectId?: string | null;
  assignee?: string | null;
  type: ManagerType;
  className?: string;
}

type TAssigneeOption = {
  value: string;
  text: string;
  id?: string;
  className?: string;
};

const AssigneeFilter = ({
  assignee,
  className,
  handleAssigneeFilterChange,
  type,
  projectId,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const { data: prospectAssignees } = useUsers({
    pageSize: 250,
    ...((type === 'ProjectIdeas' || type === 'ProjectProposals') && projectId
      ? {
          can_moderate_project: projectId,
        }
      : type === 'AllIdeas'
      ? {
          can_moderate: true,
        }
      : { can_admin: true }),
  });

  if (!authUser || !prospectAssignees) {
    return null;
  }

  const getAssigneeOptions = (prospectAssignees: IUsers) => {
    // Order of assignee filter options:
    // All ideas > Assigned to me > Unassigned > Assigned to X (other admins/mods)
    const assigneeOptions: TAssigneeOption[] = [
      {
        value: 'all',
        text: formatMessage(messages.anyAssignment),
        id: 'e2e-assignee-filter-all-posts',
      },
      {
        value: authUser.data.id,
        text: formatMessage(postManagerMessages.assignedToMe),
        id: 'e2e-assignee-filter-assigned-to-user',
      },
      {
        value: 'unassigned',
        text: formatMessage(postManagerMessages.noOne),
        id: 'e2e-assignee-filter-unassigned',
      },
    ];

    const dynamicOptions = !isNilOrError(prospectAssignees)
      ? prospectAssignees.data
          .filter((assignee) => assignee.id !== authUser.data.id)
          .map((assignee) => ({
            value: assignee.id,
            text: formatMessage(postManagerMessages.assignedTo, {
              assigneeName: getFullName(assignee),
            }),
            className: 'e2e-assignee-filter-other-user',
          }))
      : [];

    return [...assigneeOptions, ...dynamicOptions];
  };

  const onAssigneeChange = (
    _event: SyntheticEvent,
    assigneeOption: TAssigneeOption
  ) => {
    const realFiterParam =
      assigneeOption.value === 'all' ? undefined : assigneeOption.value;

    trackEventByName(tracks.assigneeFilterUsed, {
      assignee: realFiterParam,
      adminAtWork: authUser.data.id,
    });

    handleAssigneeFilterChange(realFiterParam);
  };

  return (
    <Dropdown
      className={`${className} intercom-admin-asignee-filter`}
      id="e2e-select-assignee-filter"
      data-testid="assignee-filter-dropdown"
      options={getAssigneeOptions(prospectAssignees)}
      onChange={onAssigneeChange}
      value={assignee || 'all'}
      search
      selection
    />
  );
};

export default AssigneeFilter;
