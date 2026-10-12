import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';
import { IProjectData } from 'api/projects/types';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { Outlet as RouterOutlet, useMatchRoute, useParams } from 'utils/router';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import NewPhase from './backofficeRedesign/NewPhase';
import PhaseSetup from './backofficeRedesign/Phase/PhaseSetup';
import ProjectHeader from './projectHeader';
import ProjectSidebar from './projectPage/ProjectSidebar';
import ProjectTimeline from './backofficeRedesign/ProjectTimeline';
import ProjectWorkspace from './backofficeRedesign';
import TurnOnNotice from './earlyAccess/TurnOnNotice';
import UnsavedChangesGuard from './backofficeRedesign/UnsavedChangesGuard';
import { PageSaveProvider } from './backofficeRedesign/_shared/PageSaveContext';

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
      <PageSaveProvider>
        <UnsavedChangesGuard />
        {onNewPhaseRoute ? (
          <NewPhase project={project} />
        ) : (
          <ProjectWorkspace
            project={project}
            phase={selectedPhase}
            sidePanel={
              selectedPhase ? (
                <PhaseSetup
                  key={selectedPhase.id}
                  projectId={projectId}
                  phase={selectedPhase}
                />
              ) : (
                <ProjectTimeline projectId={projectId} />
              )
            }
          >
            <RouterOutlet />
          </ProjectWorkspace>
        )}
      </PageSaveProvider>
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
      <TurnOnNotice />
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
