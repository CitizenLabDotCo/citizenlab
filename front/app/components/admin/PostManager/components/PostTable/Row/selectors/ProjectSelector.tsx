import React from 'react';

import { Label } from 'semantic-ui-react';
import styled from 'styled-components';

import useProjectById from 'api/projects/useProjectById';

import T from 'components/T';

const LabelText = styled.span`
  font-weight: 600;
`;

const StyledLabel = styled(Label)`
  white-space: nowrap;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 175px;
`;

interface Props {
  projectId: string;
}

const ProjectSelector = ({ projectId }: Props) => {
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  return (
    <StyledLabel key={project.data.id} color="teal" basic={true}>
      <LabelText>
        <T value={project.data.attributes.title_multiloc} />
      </LabelText>
    </StyledLabel>
  );
};

export default ProjectSelector;
