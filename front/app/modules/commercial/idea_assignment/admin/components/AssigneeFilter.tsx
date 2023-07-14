import React, { SyntheticEvent } from 'react';
import { adopt } from 'react-adopt';

import { isNilOrError } from 'utils/helperUtils';

// import { Select } from '@citizenlab/cl2-component-library';
import { Dropdown } from 'semantic-ui-react';

import GetUsers, { GetUsersChildProps } from 'resources/GetUsers';

import { useIntl } from 'utils/cl-intl';
import messages from './messages';
import postManagerMessages from 'components/admin/PostManager/messages';

import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';
import { ManagerType } from 'components/admin/PostManager';
import useAuthUser from 'api/me/useAuthUser';
import { getFullName } from 'utils/textUtils';

interface DataProps {
  prospectAssignees: GetUsersChildProps;
}

interface InputProps {
  handleAssigneeFilterChange: (value: string | undefined) => void;
  projectId?: string | null;
  assignee?: string | null;
  type: ManagerType;
  className?: string;
}

interface Props extends InputProps, DataProps {}

type TAssigneeOption = {
  value: string;
  text: string;
  id?: string;
  className?: string;
};

const AssigneeFilter = ({
  assignee,
  prospectAssignees,
  className,
  handleAssigneeFilterChange,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();

  if (isNilOrError(authUser)) {
    return null;
  }

  const getAssigneeOptions = (prospectAssignees: GetUsersChildProps) => {
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

    const dynamicOptions = !isNilOrError(prospectAssignees.usersList)
      ? prospectAssignees.usersList
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

const Data = adopt<DataProps, InputProps>({
  prospectAssignees: ({ type, projectId, render }) =>
    type === 'ProjectIdeas' && projectId ? (
      <GetUsers can_moderate_project={projectId} pageSize={250}>
        {render}
      </GetUsers>
    ) : type === 'AllIdeas' ? (
      <GetUsers can_moderate pageSize={250}>
        {render}
      </GetUsers>
    ) : (
      <GetUsers can_admin pageSize={250}>
        {render}
      </GetUsers>
    ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <AssigneeFilter {...inputProps} {...dataProps} />}
  </Data>
);
