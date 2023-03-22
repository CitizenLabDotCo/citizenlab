import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'react-router-dom';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import ProjectManagement from './containers/ProjectManagement';
import ProjectVisibility from './containers/ProjectVisibility';

// hooks
import useProject from 'hooks/useProject';
import useFeatureFlag from 'hooks/useFeatureFlag';

// style
import styled from 'styled-components';
import Outlet from 'components/Outlet';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const ProjectPermissions = () => {
  const { projectId } = useParams() as { projectId: string };
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
        <Outlet
          id="app.containers.Admin.project.edit.permissions.participationRights"
          projectId={projectId}
          project={project}
        >
          {(outletComponents) =>
            outletComponents.length > 0 || isProjectVisibilityEnabled ? (
              <StyledSection>
                <StyledSectionTitle>
                  <FormattedMessage
                    {...messages.participationAccessRightsTitle}
                  />
                </StyledSectionTitle>
                {outletComponents}
              </StyledSection>
            ) : null
          }
        </Outlet>
        {isProjectVisibilityEnabled && (
          <ProjectVisibility projectId={projectId} />
        )}
        <Outlet
          id="app.containers.Admin.project.edit.permissions.moderatorRights"
          projectId={projectId}
        >
          {(outletComponents) =>
            outletComponents.length > 0 ? (
              <StyledSection>
                <StyledSectionTitle>
                  <FormattedMessage {...messages.moderationRightsTitle} />
                </StyledSectionTitle>
                {outletComponents}
              </StyledSection>
            ) : null
          }
        </Outlet>
        {isProjectManagementEnabled && (
          <ProjectManagement projectId={projectId} />
        )}
      </>
    );
  }

  return null;
};

export default ProjectPermissions;
