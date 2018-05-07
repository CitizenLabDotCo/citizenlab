import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';

// resources
import GetProject from 'resources/GetProject';

interface InputProps {}

export default withRouter<InputProps>((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => {
      if (isNilOrError(project)) return null;

      return (
        <>
          <Header projectSlug={props.params.slug} />

          <ContentContainer>
            <ProjectInfo projectId={project.id} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
));
