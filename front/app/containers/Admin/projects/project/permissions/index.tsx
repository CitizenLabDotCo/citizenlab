import React, { memo } from 'react';
import { withRouter, WithRouterProps } from 'utils/cl-router/withRouter';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import ProjectManagement from './containers/ProjectManagement';
import ProjectVisibility from './containers/ProjectVisibility';
import { Title, Text } from '@citizenlab/cl2-component-library';

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
            <>
              <Title variant="h2" color="primary">
                <FormattedMessage {...messages.projectVisibilityTitle} />
              </Title>
              <Text color="coolGrey600">
                <FormattedMessage {...messages.projectVisibilitySubtitle} />
              </Text>
              <ProjectVisibility projectId={projectId} />
            </>
          )}
          <Outlet
            id="app.containers.Admin.project.edit.permissions.participationRights"
            projectId={projectId}
            project={project}
          >
            {(outletComponents) =>
              outletComponents.length > 0 || isProjectVisibilityEnabled ? (
                <StyledSection>
                  <Title variant="h2" color="primary">
                    <FormattedMessage
                      {...messages.participationRequirementsTitle}
                    />
                  </Title>
                  <Text color="coolGrey600">
                    <FormattedMessage
                      {...messages.participationRequirementsSubtitle}
                    />
                  </Text>
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
