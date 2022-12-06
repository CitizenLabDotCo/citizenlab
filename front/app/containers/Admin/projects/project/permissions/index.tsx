import React, { memo } from 'react';
import useFeatureFlag from 'hooks/useFeatureFlag';
// hooks
import useProject from 'hooks/useProject';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';
import ProjectManagement from './containers/ProjectManagement';
import Outlet from 'components/Outlet';
// components
import { Section, SectionTitle } from 'components/admin/Section';
// style
import styled from 'styled-components';
import messages from './messages';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const ProjectPermissions = memo(
  ({ params: { projectId } }: WithRouterProps) => {
    const project = useProject({ projectId });
    const isEnabled = useFeatureFlag({ name: 'project_management' });

    if (!isNilOrError(project)) {
      return (
        <>
          <Outlet
            id="app.containers.Admin.project.edit.permissions.participationRights"
            projectId={projectId}
            project={project}
          >
            {(outletComponents) =>
              outletComponents.length > 0 ? (
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
          {isEnabled && <ProjectManagement projectId={projectId} />}
        </>
      );
    }

    return null;
  }
);

export default withRouter(ProjectPermissions);
