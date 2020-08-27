import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';
import ProjectArchivedIndicator from 'components/ProjectArchivedIndicator';
import Fragment from 'components/Fragment';

// resources
import GetProject from 'resources/GetProject';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const StyledProjectArchivedIndicator = styled(ProjectArchivedIndicator)`
  padding-top: 30px;
`;

const StyledContentContainer = styled(ContentContainer)`
  background: ${colors.background};
`;

export interface InputProps {}

export default withRouter<InputProps>((props: WithRouterProps) => (
  <GetProject projectSlug={props.params.slug}>
    {(project) => {
      if (isNilOrError(project)) return null;

      return (
        <>
          <StyledProjectArchivedIndicator projectId={project.id} />
          <StyledContentContainer id="e2e-project-info-page">
            <Fragment name={`projects/${project.id}/info`}>
              <ProjectInfo projectId={project.id} />
            </Fragment>
          </StyledContentContainer>
          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
));
