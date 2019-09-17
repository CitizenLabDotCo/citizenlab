import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'react-router';

// components
import ProjectTemplatePreview from './ProjectTemplatePreview';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.div``;

export interface Props {
  projectTemplateId: string;
  className?: string;
}

const ProjectTemplatePreviewPageAdmin = memo<Props & WithRouterProps>(({ params, className }) => {
  if (params && params['projectTemplateId']) {
    return (
      <Container className={className || ''}>
        <ProjectTemplatePreview projectTemplateId={params['projectTemplateId']} />
      </Container>
    );
  }

  return null;
});

export default withRouter(ProjectTemplatePreviewPageAdmin);
