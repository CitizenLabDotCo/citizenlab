import React from 'react';

import { Title } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import { IProjectData } from 'api/projects/types';

import HorizontalScroll from './HorizontalScroll';
import LightProjectCard from './LightProjectCard';

const ProjectContainer = styled.div`
  scroll-snap-align: start;
`;

interface Props {
  title: string;
  projects: IProjectData[];
}

const ProjectCarrousel = ({ title, projects }: Props) => {
  return (
    <>
      <Title variant="h2" mt="0px">
        {title}
      </Title>
      <HorizontalScroll>
        {projects.map((project) => (
          <ProjectContainer key={project.id}>
            <LightProjectCard project={project} />
          </ProjectContainer>
        ))}
      </HorizontalScroll>
    </>
  );
};

export default ProjectCarrousel;
