import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import { IProjectData } from 'api/projects/types';
import useProjectById from 'api/projects/useProjectById';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { canModerateProject } from 'utils/permissions/rules/projectPermissions';
import { Outlet as RouterOutlet, useMatchRoute, useParams } from 'utils/router';

import ProjectWorkspace from './backofficeRedesign';
import { PhaseSaveProvider } from './backofficeRedesign/_shared/PhaseSaveContext';
import NewPhase from './backofficeRedesign/NewPhase';
import PhaseLeftPanel from './backofficeRedesign/Phase/PhaseLeftPanel';
import ProjectLeftPanel from './backofficeRedesign/ProjectLeftPanel';
import UnsavedChangesGuard from './backofficeRedesign/UnsavedChangesGuard';
import ProjectHeader from './projectHeader';
import ProjectSidebar from './projectPage/ProjectSidebar';

const AdminProjectsProjectIndex = ({ project }: { project: IProjectData }) => {
  const { data: authUser } = useAuthUser();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const workspaceEnabled = useProjectBackofficeRedesign();
  const matchRoute = useMatchRoute();
  const onNewPhaseRoute = !!matchRoute({
    to: '/$locale/admin/projects/$projectId/phases/new',
  });
  const projectId = project.id;

  const selectedPhase = phaseId ? phase?.data : undefined;

  if (!canModerateProject(project, authUser)) {
    return null;
  }

  if (workspaceEnabled) {
    return (
      <PhaseSaveProvider>
        <UnsavedChangesGuard />
        {onNewPhaseRoute ? (
          <NewPhase project={project} />
        ) : (
          <ProjectWorkspace
            project={project}
            phase={selectedPhase}
            leftPanel={
              selectedPhase ? (
                <PhaseLeftPanel
                  key={selectedPhase.id}
                  projectId={projectId}
                  phase={selectedPhase}
                />
              ) : (
                <ProjectLeftPanel projectId={projectId} />
              )
            }
          >
            <RouterOutlet />
          </ProjectWorkspace>
        )}
      </PhaseSaveProvider>
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
