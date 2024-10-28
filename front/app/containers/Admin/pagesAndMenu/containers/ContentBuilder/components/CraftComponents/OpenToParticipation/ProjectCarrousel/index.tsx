import React from 'react';

import styled from 'styled-components';

import { IProjectData } from 'api/projects/types';

import HorizontalScroll from 'components/HorizontalScroll';

import LightProjectCard from './LightProjectCard';

const ProjectContainer = styled.div`
  scroll-snap-align: start;
  margin-right: 12px;
`;

interface Props {
  projects: IProjectData[];
}

const ProjectCarrousel = ({ projects }: Props) => {
  return (
    <HorizontalScroll snap arrowScrollOffset={216}>
      {projects.map((project) => (
        <ProjectContainer key={project.id}>
          <LightProjectCard project={project} />
        </ProjectContainer>
      ))}
    </HorizontalScroll>
  );
};

export default ProjectCarrousel;
