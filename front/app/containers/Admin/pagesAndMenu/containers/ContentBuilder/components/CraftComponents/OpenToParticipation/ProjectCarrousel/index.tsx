import React from 'react';

import { Title, Box, Spinner } from '@citizenlab/cl2-component-library';
import { useInView } from 'react-intersection-observer';
import styled from 'styled-components';

import { CARD_IMAGE_ASPECT_RATIO } from 'api/project_images/useProjectImages';
import { IProjectData } from 'api/projects/types';

import { CARD_WIDTH } from './constants';
import HorizontalScroll from './HorizontalScroll';
import LightProjectCard from './LightProjectCard';

const ProjectContainer = styled.div`
  scroll-snap-align: start;
`;

interface Props {
  title: string;
  projects: IProjectData[];
  hasMore: boolean;
  onLoadMore: () => void;
}

const ProjectCarrousel = ({ title, projects, hasMore, onLoadMore }: Props) => {
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView && hasMore) {
        onLoadMore();
      }
    },
  });
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
        {hasMore && (
          <ProjectContainer>
            <Box
              ref={ref}
              w={`${CARD_WIDTH}px`}
              h={`${CARD_WIDTH / CARD_IMAGE_ASPECT_RATIO}px`}
              display="flex"
              justifyContent="center"
              alignItems="center"
            >
              <Spinner />
            </Box>
          </ProjectContainer>
        )}
      </HorizontalScroll>
    </>
  );
};

export default ProjectCarrousel;
