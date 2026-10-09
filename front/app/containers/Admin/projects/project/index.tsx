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
import { PageSaveProvider } from './backofficeRedesign/_shared/PageSaveContext';
import Event from './backofficeRedesign/Event';
import NewPhase from './backofficeRedesign/NewPhase';
import PhaseSetup from './backofficeRedesign/Phase/PhaseSetup';
import ProjectTimeline from './backofficeRedesign/ProjectTimeline';
import UnsavedChangesGuard from './backofficeRedesign/UnsavedChangesGuard';
import TurnOnNotice from './earlyAccess/TurnOnNotice';
import ProjectHeader from './projectHeader';
import ProjectSidebar from './projectPage/ProjectSidebar';

type WorkspacePage = 'newPhase' | 'event' | 'project';

const workspacePage = (
  onNewPhaseRoute: boolean,
  onEventRoute: boolean
): WorkspacePage => {
  if (onNewPhaseRoute) return 'newPhase';
  if (onEventRoute) return 'event';
  return 'project';
};

const AdminProjectsProjectIndex = ({ project }: { project: IProjectData }) => {
  const { data: authUser } = useAuthUser();
  const { phaseId } = useParams({ strict: false });
  const { data: phase } = usePhase(phaseId);
  const workspaceEnabled = useProjectBackofficeRedesign();
  const matchRoute = useMatchRoute();
  const onNewPhaseRoute = !!matchRoute({
    to: '/$locale/admin/projects/$projectId/phases/new',
  });
  const onEventRoute = !!matchRoute({
    to: '/$locale/admin/projects/$projectId/events/$id',
  });
  const projectId = project.id;
  const page = workspacePage(onNewPhaseRoute, onEventRoute);

  const selectedPhase = phaseId ? phase?.data : undefined;

  if (!canModerateProject(project, authUser)) {
    return null;
  }

  if (workspaceEnabled) {
    return (
      <PageSaveProvider>
        <UnsavedChangesGuard />
        {page === 'newPhase' && <NewPhase project={project} />}
        {page === 'event' && <Event project={project} />}
        {page === 'project' && (
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
