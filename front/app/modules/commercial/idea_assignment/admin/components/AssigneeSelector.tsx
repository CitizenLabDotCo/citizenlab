import React from 'react';
import styled from 'styled-components';

// typings
import { IOption } from 'typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

// components
import { Select } from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

import useUpdateProject from 'api/projects/useUpdateProject';
import useProjectById from 'api/projects/useProjectById';
import { getFullName } from 'utils/textUtils';
import useUsers from 'api/users/useUsers';

const StyledSelect = styled(Select)`
  width: 300px;
`;

interface Props {
  projectId: string;
}

const IdeaAssignment = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: project } = useProjectById(projectId);
  const { data: adminsAndMods } = useUsers({ can_moderate_project: projectId });
  const { mutate: updateProject } = useUpdateProject();

  const getOptions = () => {
    const prospectAssignees = adminsAndMods?.data;
    let projectAssigneeOptions: IOption[] = [];

    if (!isNilOrError(prospectAssignees)) {
      projectAssigneeOptions = prospectAssignees.map((prospectAssignee) => {
        return {
          value: prospectAssignee.id,
          label: getFullName(prospectAssignee),
        };
      });
    }

    return [
      {
        value: 'unassigned',
        label: formatMessage(messages.unassigned),
      },
      ...projectAssigneeOptions,
    ];
  };

  const onAssigneeChange = (assigneeOption: IOption) => {
    // convert 'unassigned' to null for the back-end update
    const defaultAssigneeId =
      assigneeOption.value !== 'unassigned' ? assigneeOption.value : null;

    updateProject({
      projectId,
      default_assignee_id: defaultAssigneeId,
    });
  };

  if (project) {
    const defaultAssigneeId =
      project.data.relationships?.default_assignee?.data?.id;
    // If defaultAssigneeValue is not a string, it's null, so we convert it to a string (see getoptions)
    const defaultAssigneeValue =
      typeof defaultAssigneeId === 'string' ? defaultAssigneeId : 'unassigned';

    return (
      <StyledSelect
        options={getOptions()}
        value={defaultAssigneeValue}
        onChange={onAssigneeChange}
      />
    );
  }

  return null;
};

export default IdeaAssignment;
