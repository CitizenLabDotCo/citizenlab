import React from 'react';

import styled from 'styled-components';

import { IProjectData } from 'api/projects/types';

import { Section } from 'components/admin/Section';

import Timeline from './Timeline';

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
