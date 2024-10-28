import React from 'react';

import styled from 'styled-components';

import HorizontalScroll from 'components/HorizontalScroll';

const PROJECTS = Array.from({ length: 5 }).fill(0);

const ProjectContainer = styled.div`
  scroll-snap-align: start;
  background-color: blue;
  margin-right: 12px;
  padding: 80px;
  scroll-snap-align: start;
`;

const ProjectCarrousel = () => {
  return (
    <HorizontalScroll snap>
      {PROJECTS.map((_, index) => (
        <ProjectContainer key={index}>Project {index}</ProjectContainer>
      ))}
    </HorizontalScroll>
  );
};

export default ProjectCarrousel;
