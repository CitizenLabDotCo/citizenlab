import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import { IProjectData } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { canModerateProject } from 'utils/permissions/rules/projectPermissions';
import { Outlet as RouterOutlet, useParams } from 'utils/router';

import ProjectSidebar from './newBackoffice/ProjectSidebar';
import ProjectWorkspace from './newBackoffice/ProjectWorkspace';
import PhaseLeftPanel from './newBackoffice/ProjectWorkspace/Phase/PhaseLeftPanel';
import PhaseRightPanel from './newBackoffice/ProjectWorkspace/Phase/PhaseRightPanel';
import ProjectLeftPanel from './newBackoffice/ProjectWorkspace/ProjectLeftPanel';
import ProjectRightPanel from './newBackoffice/ProjectWorkspace/ProjectRightPanel';
import ProjectHeader from './projectHeader';

const AdminProjectsProjectIndex = ({ project }: { project: IProjectData }) => {
  const { data: authUser } = useAuthUser();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const workspaceEnabled = useFeatureFlag({ name: 'project_workspace' });
  const projectId = project.id;

  const selectedPhase = phaseId ? phase?.data : undefined;

  if (!canModerateProject(project, authUser)) {
    return null;
  }

  if (workspaceEnabled) {
    return (
      <ProjectWorkspace
        project={project}
        phase={selectedPhase}
        leftPanel={
          selectedPhase ? (
            <PhaseLeftPanel projectId={projectId} />
          ) : (
            <ProjectLeftPanel projectId={projectId} />
          )
        }
        rightPanel={selectedPhase ? <PhaseRightPanel /> : <ProjectRightPanel />}
      >
        <RouterOutlet />
      </ProjectWorkspace>
    );
  }

  return (
    <Box
      data-cy="e2e-admin-projects-project-index"
      display="flex"
      flexDirection="column"
      height="100vh"
      overflow="hidden"
    >
      <ProjectHeader projectId={projectId} />
      <Box display="flex" flexGrow={1} minHeight="0" overflow="hidden">
        <ProjectSidebar projectId={projectId} />
        <Box flexGrow={1} minWidth="0" overflowY="auto">
          <RouterOutlet />
        </Box>
      </Box>
    </Box>
  );
};

const AdminProjectsProjectIndexWrapper = () => {
  const { projectId } = useParams({ strict: false }) as { projectId: string };
  const { data: project } = useProjectById(projectId);

  if (!project) return null;

  return <AdminProjectsProjectIndex project={project.data} />;
};

export default AdminProjectsProjectIndexWrapper;
