import React from 'react';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';

// resources
import GetProject from 'resources/GetProject';

interface InputProps {
  params: {
    slug: string;
  };
}

export default (inputProps: InputProps) => (
  <GetProject slug={inputProps.params.slug}>
    {project => {
      const { slug } = inputProps.params;

      if (!project) return null;

      return (
        <>
          <Header slug={slug} />

          <ContentContainer>
            <ProjectInfo projectId={project.id} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
);
