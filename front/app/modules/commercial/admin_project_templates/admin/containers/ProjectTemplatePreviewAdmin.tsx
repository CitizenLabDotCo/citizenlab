import React, { memo } from 'react';

import { get } from 'lodash-es';
import styled from 'styled-components';

import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';

import ProjectTemplatePreview from '../../components/ProjectTemplatePreview';

const Container = styled.div`
  width: 100%;
  max-width: 1050px;
  margin-bottom: 60px;
`;
export interface Props {
  projectTemplateId?: string;
  className?: string;
}

const ProjectTemplatePreviewAdmin = memo<Props & WithRouterProps>(
  ({ params, projectTemplateId, className }) => {
    const templateId: string | undefined =
      projectTemplateId || get(params, 'projectTemplateId');

    if (templateId) {
      return (
        <Container className={className || ''}>
          <ProjectTemplatePreview projectTemplateId={templateId} />
        </Container>
      );
    }

    return null;
  }
);

export default withRouter(ProjectTemplatePreviewAdmin);
