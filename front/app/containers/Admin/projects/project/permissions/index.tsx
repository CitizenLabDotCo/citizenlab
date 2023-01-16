import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

// i18n

// components
import { SectionTitle } from 'components/admin/Section';
import ProjectManagement from './containers/ProjectManagement';
import ProjectVisibility from './containers/ProjectVisibility';

// hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';

// style
import styled from 'styled-components';

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const ProjectPermissions = memo(
  ({ params: { projectId } }: WithRouterProps) => {
    const project = useProject({ projectId });
    const isProjectManagementEnabled = useFeatureFlag({
      name: 'project_management',
    });

    const isProjectVisibilityEnabled = useFeatureFlag({
      name: 'project_visibility',
    });

    if (!isNilOrError(project)) {
      return (
        <>
          {isProjectVisibilityEnabled && (
            <ProjectVisibility projectId={projectId} />
          )}
          {isProjectManagementEnabled && (
            <ProjectManagement projectId={projectId} />
          )}
        </>
      );
    }

    return null;
  }
);

export default withRouter(ProjectPermissions);
