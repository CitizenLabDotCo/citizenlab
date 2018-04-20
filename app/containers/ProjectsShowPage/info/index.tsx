import React from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';

// resources
import GetProject from 'resources/GetProject';

interface InputProps {}

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <GetProject slug={inputProps.params.slug}>
    {project => {
      const { slug } = inputProps.params;

      if (!project) return null;

      return (
        <>
          <Header projectSlug={slug} />

          <ContentContainer>
            <ProjectInfo projectId={project.id} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
));
