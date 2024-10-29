import React from 'react';

import styled from 'styled-components';

import { IProjectData } from 'api/projects/types';

import HorizontalScroll from './HorizontalScroll';
import LightProjectCard from './LightProjectCard';

const ProjectContainer = styled.div`
  scroll-snap-align: start;
`;

interface Props {
  projects: IProjectData[];
}

const ProjectCarrousel = ({ projects }: Props) => {
  return (
    <HorizontalScroll>
      {projects.map((project) => (
        <ProjectContainer key={project.id}>
          <LightProjectCard project={project} />
        </ProjectContainer>
      ))}
    </HorizontalScroll>
  );
};

export default ProjectCarrousel;
