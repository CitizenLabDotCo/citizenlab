import React, { lazy } from 'react';

import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { parseModuleRoutes, RouteConfiguration } from 'utils/moduleUtils';
import { createRoute, Navigate } from 'utils/router';

import { adminRoute } from '../routes';

const AdminProjectIdeaPreviewIndex = lazy(
  () => import('./AdminProjectIdeaPreviewIndex')
);
const IdeaFormBuilder = lazy(
  () => import('./project/inputForm/IdeaFormBuilder')
);
const SurveyFormBuilder = lazy(
  () => import('./project/nativeSurvey/SurveyFormBuilder')
);
const ProjectMessaging = lazy(() => import('./project/messaging/All'));
const ProjectMessagingNew = lazy(() => import('./project/messaging/New'));
const ProjectMessagingEdit = lazy(() => import('./project/messaging/Edit'));
const ProjectMessagingShow = lazy(() => import('./project/messaging/Show'));
const AdminProjectsAndFolders = lazy(() => import('.'));
const AdminProjectsList = lazy(() => import('./all'));
const AdminProjectNew = lazy(() => import('./new'));
const AdminProjectsProjectIndex = lazy(() => import('./project'));
const AdminProjectPhaseIndex = lazy(() => import('./project/phase'));
const AdminProjectsProjectGeneral = lazy(() => import('./project/general'));
const AdminProjectsProjectGeneralSetUp = lazy(
  () => import('./project/general/setUp')
);
const AdminProjectsProjectAudience = lazy(
  () => import('../../../components/admin/participation')
);
const AdminPhaseNewAndEdit = lazy(() => import('./project/phaseSetup'));
const AdminProjectFiles = lazy(() => import('./project/files'));
const AdminProjectEvents = lazy(() => import('./project/events'));
const AdminProjectEventsEdit = lazy(() => import('./project/events/edit'));
const AdminProjectPermissions = lazy(
  () => import('./project/permissions/Project')
);
const AdminPhasePermissions = lazy(() => import('./project/permissions/Phase'));
const AdminPhaseEmails = lazy(
  () => import('./project/admin_phase_email_wrapper')
);
const AdminProjectSurveyResults = lazy(() => import('./project/surveyResults'));
const AdminProjectPoll = lazy(() => import('./project/poll'));
const AdminProjectsSurvey = lazy(() => import('./project/nativeSurvey'));

const AdminProjectIdeaForm = lazy(() => import('./project/inputForm'));
const AdminPhaseSurveyFormTabPanel = lazy(
  () => import('./project/surveyForm/TabPanel')
);

const AdminProjectIdeas = lazy(() => import('./project/ideas'));
const InputImporter = lazy(() => import('./project/inputImporter'));

const AdminProjectVolunteering = lazy(() => import('./project/volunteering'));
const AdminProjectVolunteeringNew = lazy(
  () => import('./project/volunteering/NewCause')
);
const AdminProjectVolunteeringEdit = lazy(
  () => import('./project/volunteering/EditCause')
);
const AdminAllowedTopicsComponent = lazy(() => import('./project/topics'));
const AdminCustomMapConfigComponent = lazy(
  () => import('containers/Admin/CustomMapConfigPage')
);

const AdminProjectAnalysis = lazy(() => import('./project/analysis'));
const ReportTab = lazy(() => import('./project/information/ReportTab'));
const AdminPhaseInsights = lazy(() => import('./project/insights'));

const AdminProjectProposals = lazy(() => import('./project/proposals'));

const AdminProjectsData = lazy(() => import('./project/data'));

const EmailsEdit = lazy(() => import('../messaging/Edit'));

export function adminProjectsProjectPath(projectId: string) {
  return `/admin/projects/${projectId}`;
}

// --- Search parameter schemas ---

// Survey form builder search schema
const surveyFormBuilderSearchSchema = yup.object({
  copy_from: yup.string().optional(),
});

export type SurveyFormBuilderSearchParams = yup.InferType<
  typeof surveyFormBuilderSearchSchema
>;

// Input importer search schema
const inputImporterSearchSchema = yup.object({
  parser: yup.string().oneOf(['legacy', 'gpt']).optional(),
});

export type InputImporterSearchParams = yup.InferType<
  typeof inputImporterSearchSchema
>;

// --- Projects layout route ---
const projectsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'projects',
  component: () => (
    <PageLoading>
      <AdminProjectsAndFolders />
    </PageLoading>
  ),
});

// Projects index (list)
const projectsIndexRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminProjectsList />
    </PageLoading>
  ),
});

// New project
const projectNewRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      <AdminProjectNew />
    </PageLoading>
  ),
});

// Project idea preview
const projectIdeaPreviewRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '$projectId/ideas/$ideaId',
  component: () => (
    <PageLoading>
      <AdminProjectIdeaPreviewIndex />
    </PageLoading>
  ),
});

// --- Single project layout ---
const projectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '$projectId',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectIndex />
    </PageLoading>
  ),
});

// Project index redirect
const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: '/',
  component: () => <Navigate to="phases/setup" replace />,
});

// --- General settings layout ---
const projectGeneralRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'general',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectGeneral />
    </PageLoading>
  ),
});

const projectGeneralIndexRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectGeneralSetUp />
    </PageLoading>
  ),
});

const projectGeneralInputTagsRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: 'input-tags',
  component: () => <AdminAllowedTopicsComponent />,
});

const projectGeneralAccessRightsRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: 'access-rights',
  component: () => (
    <PageLoading>
      <AdminProjectPermissions />
    </PageLoading>
  ),
});

const projectGeneralDataRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: 'data',
  component: () => (
    <PageLoading>
      <AdminProjectsData />
    </PageLoading>
  ),
});

// --- Audience layout ---
const projectAudienceRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'audience',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectAudience />
    </PageLoading>
  ),
});

const projectAudienceIndexRoute = createRoute({
  getParentRoute: () => projectAudienceRoute,
  path: '/',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectAudience />
    </PageLoading>
  ),
});

const projectAudienceDemographicsRoute = createRoute({
  getParentRoute: () => projectAudienceRoute,
  path: 'demographics',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectAudience />
    </PageLoading>
  ),
});

const projectAudienceTrafficRoute = createRoute({
  getParentRoute: () => projectAudienceRoute,
  path: 'traffic',
  component: () => (
    <PageLoading>
      <AdminProjectsProjectAudience />
    </PageLoading>
  ),
});

// --- Messaging routes ---
const projectMessagingRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'messaging',
  component: () => (
    <PageLoading>
      <ProjectMessaging />
    </PageLoading>
  ),
});

const projectMessagingNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'messaging/new',
  component: () => (
    <PageLoading>
      <ProjectMessagingNew />
    </PageLoading>
  ),
});

const projectMessagingEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'messaging/$campaignId/edit',
  component: () => (
    <PageLoading>
      <ProjectMessagingEdit />
    </PageLoading>
  ),
});

const projectMessagingShowRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'messaging/$campaignId',
  component: () => (
    <PageLoading>
      <ProjectMessagingShow />
    </PageLoading>
  ),
});

// --- Analysis route ---
const projectAnalysisRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'analysis/$analysisId',
  component: () => (
    <PageLoading>
      <AdminProjectAnalysis />
    </PageLoading>
  ),
});

// --- Files route ---
const projectFilesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'files',
  component: () => (
    <PageLoading>
      <AdminProjectFiles />
    </PageLoading>
  ),
});

// --- Events routes ---
const projectEventsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'events',
  component: () => (
    <PageLoading>
      <AdminProjectEvents />
    </PageLoading>
  ),
});

const projectEventsNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'events/new',
  component: () => (
    <PageLoading>
      <AdminProjectEventsEdit />
    </PageLoading>
  ),
});

const projectEventsEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'events/$id',
  component: () => (
    <PageLoading>
      <AdminProjectEventsEdit />
    </PageLoading>
  ),
});

// --- Phases layout ---
const projectPhasesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'phases',
  component: () => (
    <PageLoading>
      <AdminProjectPhaseIndex />
    </PageLoading>
  ),
});

const phasesSetupRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: 'setup',
  component: () => (
    <PageLoading>
      <AdminPhaseNewAndEdit />
    </PageLoading>
  ),
});

const phaseSetupRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/setup',
  component: () => (
    <PageLoading>
      {/* We use the key here to make sure that the component is treated as a different instance
      to differentiate between the new and edit phase. This distinction is especially important
      when the component is already visible and the route changes to the same component.
      For example, from phase setup to creating a new phase.
      */}
      <AdminPhaseNewAndEdit key="setup" />
    </PageLoading>
  ),
});

const phaseNewRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: 'new',
  component: () => (
    <PageLoading>
      {/* We use the key here to make sure that the component is treated as a different instance
      to differentiate between the new and edit phase. This distinction is especially important
      when the component is already visible and the route changes to the same component.
      For example, from phase setup to creating a new phase.
      */}
      <AdminPhaseNewAndEdit key="new" />
    </PageLoading>
  ),
});

const phaseRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId',
  component: () => (
    <PageLoading>
      <AdminPhaseNewAndEdit />
    </PageLoading>
  ),
});

const phaseExternalSurveyResultsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/survey-results',
  component: () => (
    <PageLoading>
      <AdminProjectSurveyResults />
    </PageLoading>
  ),
});

const phasePollsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/polls',
  component: () => (
    <PageLoading>
      <AdminProjectPoll />
    </PageLoading>
  ),
});

const phaseAccessRightsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/access-rights',
  component: () => (
    <PageLoading>
      <AdminPhasePermissions />
    </PageLoading>
  ),
});

const phaseEmailsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/emails',
  component: () => (
    <PageLoading>
      <AdminPhaseEmails />
    </PageLoading>
  ),
});

const phaseEmailsCampaignEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/emails/$campaignId/edit',
  component: () => <EmailsEdit campaignType="automated" />,
});

const phaseIdeasRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/ideas',
  component: () => (
    <PageLoading>
      <AdminProjectIdeas />
    </PageLoading>
  ),
});

const phaseIdeaFormRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/form',
  component: () => (
    <PageLoading>
      <AdminProjectIdeaForm />
    </PageLoading>
  ),
});

const phaseProposalsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/proposals',
  component: () => (
    <PageLoading>
      <AdminProjectProposals />
    </PageLoading>
  ),
});

const phaseVolunteeringRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/volunteering',
  component: () => (
    <PageLoading>
      <AdminProjectVolunteering />
    </PageLoading>
  ),
});

const phaseMapRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/map',
  component: () => (
    <PageLoading>
      <AdminCustomMapConfigComponent />
    </PageLoading>
  ),
});

const phaseVolunteeringNewCauseRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/volunteering/causes/new',
  component: () => (
    <PageLoading>
      <AdminProjectVolunteeringNew />
    </PageLoading>
  ),
});

const phaseNativeSurveyResultsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/results',
  component: () => (
    <PageLoading>
      <AdminProjectsSurvey />
    </PageLoading>
  ),
});

const phaseSurveyFormRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/survey-form',
  component: () => (
    <PageLoading>
      <AdminPhaseSurveyFormTabPanel />
    </PageLoading>
  ),
});

const phaseIdeaFormEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/form/edit',
  component: () => (
    <PageLoading>
      <IdeaFormBuilder />
    </PageLoading>
  ),
});

const phaseNativeSurveyFormEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/survey-form/edit',
  validateSearch: (
    search: Record<string, unknown>
  ): SurveyFormBuilderSearchParams =>
    surveyFormBuilderSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <SurveyFormBuilder />
    </PageLoading>
  ),
});

const phaseVolunteeringCauseRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/volunteering/causes/$causeId',
  component: () => (
    <PageLoading>
      <AdminProjectVolunteeringEdit />
    </PageLoading>
  ),
});

const phaseInputImporterRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/input-importer',
  validateSearch: (
    search: Record<string, unknown>
  ): InputImporterSearchParams =>
    inputImporterSearchSchema.validateSync(search, { stripUnknown: true }),
  component: () => (
    <PageLoading>
      <InputImporter />
    </PageLoading>
  ),
});

const phaseReportRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/report',
  component: () => (
    <PageLoading>
      <ReportTab />
    </PageLoading>
  ),
});

const phaseInsightsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/insights',
  component: () => (
    <PageLoading>
      <AdminPhaseInsights />
    </PageLoading>
  ),
});

// Factory function to create the admin projects route tree
const createAdminProjectsRoutes = (moduleRoutes: RouteConfiguration[] = []) => {
  return projectsRoute.addChildren([
    projectsIndexRoute,
    // TODO: Wire in module routes (admin.project_templates, admin.projects) after conversion
    projectNewRoute,
    projectIdeaPreviewRoute,
    projectRoute.addChildren([
      projectIndexRoute,
      projectGeneralRoute.addChildren([
        projectGeneralIndexRoute,
        projectGeneralInputTagsRoute,
        projectGeneralAccessRightsRoute,
        projectGeneralDataRoute,
      ]),
      projectAudienceRoute.addChildren([
        projectAudienceIndexRoute,
        projectAudienceDemographicsRoute,
        projectAudienceTrafficRoute,
      ]),
      projectMessagingRoute,
      projectMessagingNewRoute,
      projectMessagingEditRoute,
      projectMessagingShowRoute,
      projectAnalysisRoute,
      projectFilesRoute,
      projectEventsRoute,
      projectEventsNewRoute,
      projectEventsEditRoute,
      projectPhasesRoute.addChildren([
        phasesSetupRoute,
        phaseSetupRoute,
        phaseNewRoute,
        phaseRoute,
        phaseExternalSurveyResultsRoute,
        phasePollsRoute,
        phaseAccessRightsRoute,
        phaseEmailsRoute,
        phaseEmailsCampaignEditRoute,
        phaseIdeasRoute,
        phaseIdeaFormRoute,
        phaseProposalsRoute,
        phaseVolunteeringRoute,
        phaseMapRoute,
        phaseVolunteeringNewCauseRoute,
        phaseNativeSurveyResultsRoute,
        phaseSurveyFormRoute,
        phaseIdeaFormEditRoute,
        phaseNativeSurveyFormEditRoute,
        phaseVolunteeringCauseRoute,
        phaseInputImporterRoute,
        phaseReportRoute,
        phaseInsightsRoute,
      ]),
    ]),
    ...(parseModuleRoutes(moduleRoutes, projectsRoute) as never[]),
  ]);
};

export default createAdminProjectsRoutes;
