import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

// components
import Header from '../Header';
import ContentContainer from 'components/ContentContainer';
import ProjectInfo from './ProjectInfo';
import EventsPreview from '../EventsPreview';
import ProjectModeratorIndicator from 'components/ProjectModeratorIndicator';
import Warning from 'components/UI/Warning';

// resources
import GetProject from 'resources/GetProject';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../Admin/pages/messages';

// style
import styled from 'styled-components';

const StyledContentContainer = styled(ContentContainer)`
  margin-top: 15px;
`;

interface InputProps {}

export default withRouter<InputProps>((props: WithRouterProps) => (
  <GetProject slug={props.params.slug}>
    {project => {
      if (isNilOrError(project)) return null;

      return (
        <>
          <Header projectSlug={props.params.slug} />

          <ProjectModeratorIndicator projectId={project.id} />

          {project.attributes.publication_status === 'archived' &&
            <StyledContentContainer>
              <Warning text={<FormattedMessage {...messages.archivedProject} />} />
            </StyledContentContainer>
          }

          <ContentContainer>
            <ProjectInfo projectId={project.id} />
          </ContentContainer>

          <EventsPreview projectId={project.id} />
        </>
      );
    }}
  </GetProject>
));
