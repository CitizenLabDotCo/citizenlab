import React from 'react';

import { Label } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import T from 'components/T';

const StyledLabel = styled(Label)`
  display: inline;
  white-space: nowrap;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  color: teal;
  border: 1px solid teal;
  border-radius: 4px;
  font-size: 12px;
  padding: 2px 4px;
  font-weight: 600;
`;

interface Props {
  projectId: string;
}

const ProjectSelector = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  return (
    <StyledLabel>
      <T value={project.data.attributes.title_multiloc} />
    </StyledLabel>
  );
};

export default ProjectSelector;
