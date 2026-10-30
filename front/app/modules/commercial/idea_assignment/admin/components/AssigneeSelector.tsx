import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useUpdateProject from 'api/projects/useUpdateProject';

import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

import useProjectAssignee from './useProjectAssignee';

const StyledSelect = styled(Select)`
  width: 300px;
`;

interface Props {
  projectId: string;
}

const IdeaAssignment = ({ projectId }: Props) => {
  const { loaded, options, savedAssignee } = useProjectAssignee(projectId);
  const { mutate: updateProject } = useUpdateProject();

  if (!loaded) return null;

  const assignee = savedAssignee ?? UNASSIGNED;

  const setAssignee = (value: string) => {
    if (value === assignee) return;

    updateProject({
      projectId,
      default_assignee_id: value === UNASSIGNED ? null : value,
    });
  };

  return (
    <StyledSelect
      options={options}
      value={assignee}
      onChange={(option: IOption) => setAssignee(option.value)}
    />
  );
};

export default IdeaAssignment;
