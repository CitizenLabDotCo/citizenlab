import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';

import styled from 'styled-components';

const Mod = styled(ProjectModeratorIndicator)`
  max-width: ${props => props.theme.maxPageWidth}px;
`;

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
          <Mod projectId={project.id} displayType="message" />

          <ContentContainer>
            <ProjectInfo projectId={project.id} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
));
