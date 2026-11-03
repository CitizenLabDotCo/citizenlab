import React from 'react';

import { Select } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { IOption } from 'typings';

import useProjectAssignee from './useProjectAssignee';

const StyledSelect = styled(Select)`
  width: 300px;
`;

interface Props {
  projectId: string;
}

const IdeaAssignment = ({ projectId }: Props) => {
  const { loaded, options, assignee, setAssignee } =
    useProjectAssignee(projectId);

  if (!loaded) return null;

  return (
    <StyledSelect
      options={options}
      value={assignee}
      onChange={(option: IOption) => setAssignee(option.value)}
    />
  );
};

export default IdeaAssignment;
