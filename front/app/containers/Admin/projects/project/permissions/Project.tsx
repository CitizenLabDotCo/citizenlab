import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import Outlet from 'components/Outlet';

import { FormattedMessage } from 'utils/cl-intl';

import ProjectManagement from './containers/ProjectManagement';
import ProjectVisibility from './containers/ProjectVisibility';
import Granular from './granular_permissions/containers/Granular';
import messages from './messages';

const Project = () => {
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);

  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
  });

  if (!projectId || !project) return null;

  return (
    <>
      <Title variant="h2" color="primary">
        <FormattedMessage {...messages.projectVisibilityTitle} />
      </Title>
      <Text color="coolGrey600">
        <FormattedMessage {...messages.projectVisibilitySubtitle} />
      </Text>
      <ProjectVisibility projectId={projectId} />
      {isGranularPermissionsEnabled && (
        <Box mb="48px">
          <Title variant="h2" color="primary">
            <FormattedMessage {...messages.participationRequirementsTitle} />
          </Title>
          <Text color="coolGrey600" pb="8px">
            <FormattedMessage {...messages.participationRequirementsSubtitle} />
          </Text>
          <Granular project={project.data} />
        </Box>
      )}
      <Outlet
        id="app.containers.Admin.project.edit.permissions.moderatorRights"
        projectId={projectId}
      >
        {(outletComponents) =>
          outletComponents.length > 0 ? (
            <Box mb="48px">{outletComponents}</Box>
          ) : null
        }
      </Outlet>
      <ProjectManagement projectId={projectId} />
    </>
  );
};

export default Project;
