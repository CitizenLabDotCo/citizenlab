import React from 'react';
import { useParams } from 'react-router-dom';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';

// components
import { Section, SectionTitle } from 'components/admin/Section';
import ProjectManagement from './containers/ProjectManagement';
import ProjectVisibility from './containers/ProjectVisibility';
import { Title, Text } from '@citizenlab/cl2-component-library';

// hooks
import useProjectById from 'api/projects/useProjectById';
import useFeatureFlag from 'hooks/useFeatureFlag';
import usePhase from 'api/phases/usePhase';

// style
import styled from 'styled-components';
import Outlet from 'components/Outlet';
import Granular from './granular_permissions/containers/Granular';
import PhasePermissions from './granular_permissions/containers/Granular/PhasePermissions';

const StyledSection = styled(Section)`
  margin-bottom: 50px;
`;

export const StyledSectionTitle = styled(SectionTitle)`
  margin-bottom: 30px;
`;

const ProjectPermissions = () => {
  const { projectId, phaseId } = useParams() as {
    projectId: string;
    phaseId?: string;
  };

  const { data: phase } = usePhase(phaseId || null);
  const { data: project } = useProjectById(projectId);
  const { formatMessage } = useIntl();

  const isProjectVisibilityEnabled = useFeatureFlag({
    name: 'project_visibility',
  });

  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
  });

  const isProjectManagementEnabled = useFeatureFlag({
    name: 'project_management',
  });

  if (phase && project) {
    return isGranularPermissionsEnabled && isProjectVisibilityEnabled ? (
      <StyledSection>
        <Title variant="h2" color="primary">
          <FormattedMessage {...messages.participationRequirementsTitle} />
        </Title>
        <Text color="coolGrey600" pb="8px">
          <FormattedMessage {...messages.participationRequirementsSubtitle} />
        </Text>
        <PhasePermissions project={project.data} phase={phase.data} />
      </StyledSection>
    ) : null;
  }

  if (project) {
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
        {isGranularPermissionsEnabled && isProjectVisibilityEnabled && (
          <StyledSection>
            <Title variant="h2" color="primary">
              <FormattedMessage {...messages.participationRequirementsTitle} />
            </Title>
            <Text color="coolGrey600" pb="8px">
              <FormattedMessage
                {...messages.participationRequirementsSubtitle}
              />
            </Text>
            <Granular project={project.data} />
          </StyledSection>
        )}
        <Outlet
          id="app.containers.Admin.project.edit.permissions.moderatorRights"
          projectId={projectId}
        >
          {(outletComponents) =>
            outletComponents.length > 0 ? (
              <StyledSection>{outletComponents}</StyledSection>
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
