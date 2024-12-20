import React from 'react';

import { colors, IOption, Select } from '@citizenlab/cl2-component-library';
import { memoize } from 'lodash-es';
import styled from 'styled-components';

import useAuthUser from 'api/me/useAuthUser';
import { IUser, IUsers } from 'api/users/types';
import useUsers from 'api/users/useUsers';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

const StyledSelect = styled(Select)`
  width: 160px;

  // Semantic UI Select component was replaced here which changed the UI, but I wanted to
  // maintain similar styles to what we had before so it looks visually consistent.
  select {
    padding-right: 36px;
    padding-top: 4px;
    padding-bottom: 4px;
    border: solid 1px ${colors.grey300};
    color: ${colors.primary};
    font-size: 14px;
  }
`;
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
          label: formatMessage(messages.assignedTo, {
            assigneeName: `${assignee.attributes.first_name} ${assignee.attributes.last_name}`,
          }),
        }));

      // Order of assignee filter options:
      // Assigned to me > Unassigned > Assigned to X (other admins/mods)
      return [
        {
          value: authUser.data.id,
          label: formatMessage(messages.assignedToMe),
        },
        {
          value: 'unassigned',
          label: formatMessage(messages.noOne),
        },
        ...dynamicOptions,
      ];
    }
  );

  const handleOnAssigneeChange = (option: IOption) => {
    if (typeof option.value === 'string') {
      onAssigneeChange(
        option.value === 'unassigned' ? undefined : option.value
      );
    }
  };

  return (
    <StyledSelect
      id={'post-row-select-assignee'}
      options={getAssigneeOptions(prospectAssignees, authUser)}
      onChange={handleOnAssigneeChange}
      value={assigneeId || 'unassigned'}
      className="fluid e2e-post-manager-post-row-assignee-select"
    />
  );
};

export default AssigneeSelect;
