import React from 'react';
import { IProjectData } from 'api/projects/types';
import styled from 'styled-components';

// components
import Timeline from './Timeline';
import { Section } from 'components/admin/Section';

const StyledSection = styled(Section)`
  margin-bottom: 30px;
`;

interface Props {
  project: IProjectData;
}

const Granular = ({ project }: Props) => {
  const projectId = project.id;

  return (
    <StyledSection id="e2e-granular-permissions">
      <Timeline projectId={projectId} />
    </StyledSection>
  );
};

export default Granular;
