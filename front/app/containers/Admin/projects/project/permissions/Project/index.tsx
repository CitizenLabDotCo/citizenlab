import React from 'react';

import { Title, Text, Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useProjectById from 'api/projects/useProjectById';

import Outlet from 'components/Outlet';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import ProjectManagement from './ProjectManagement';
import ProjectVisibility from './ProjectVisibility';

const Project = () => {
  const { projectId } = useParams();
  const { data: project } = useProjectById(projectId);

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
