import React, { lazy } from 'react';

import { RouteType } from 'routes';
import * as yup from 'yup';

import PageLoading from 'components/UI/PageLoading';

import { parseModuleRoutes, RouteConfiguration } from 'utils/moduleUtils';
import { createRoute, Navigate } from 'utils/router';

import { adminRoute, AdminRoute } from '../routes';

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

export function adminProjectsProjectPath(projectId: string): RouteType {
  return `/admin/projects/${projectId}`;
}

export enum projectsRoutes {
  projects = 'projects',
  new = 'new',
  projectIdeaId = '$projectId/ideas/$ideaId',
  projectGeneral = 'general',
  projectGeneralSetUp = 'set-up',
  projectGeneralInputTags = 'input-tags',
  projectGeneralAccessRights = 'access-rights',
  projectGeneralData = 'data',
  projectAudience = 'audience',
  projectSettingsDescription = 'description',
  projectMessaging = 'messaging',
  projectMessagingNew = 'messaging/new',
  projectMessagingEdit = 'messaging/$campaignId/edit',
  projectMessagingShow = 'messaging/$campaignId',
  projectFiles = 'files',
  projectEvents = 'events',
  projectEventsNew = 'events/new',
  projectEventsId = 'events/$id',
  projectSettingsTags = 'tags',
  projectId = '$projectId',
  projectIdPhases = 'phases',
  projectPhasesSetup = 'setup',
  projectPhaseSetup = '$phaseId/setup',
  projectPhase = '$phaseId',
  projectPhaseExternalSurveyResults = '$phaseId/survey-results',
  projectPhasePolls = '$phaseId/polls',
  projectPhaseAccessRights = '$phaseId/access-rights',
  projectPhaseEmails = '$phaseId/emails',
  projectPhaseEmailsCampaignEdit = '$phaseId/emails/$campaignId/edit',
  projectPhaseIdeas = '$phaseId/ideas',
  projectPhaseProposals = '$phaseId/proposals',
  projectPhaseIdeaForm = '$phaseId/form',
  projectPhaseVolunteering = '$phaseId/volunteering',
  projectPhaseMap = '$phaseId/map',
  projectPhaseNativeSurveyResults = '$phaseId/results',
  projectPhaseSurveyForm = '$phaseId/survey-form',
  projectPhaseNativeSurveyFormEdit = '$phaseId/survey-form/edit',
  projectPhaseVolunteeringNewCause = '$phaseId/volunteering/causes/new',
  projectPhaseIdeaFormEdit = '$phaseId/form/edit',
  projectPhaseVolunteeringCause = '$phaseId/volunteering/causes/$causeId',
  projectPhaseInputImporter = '$phaseId/input-importer',
  projectPhaseReport = '$phaseId/report',
  projectPhaseInsights = '$phaseId/insights',
  projectAnalysis = 'analysis/$analysisId',
}

export type projectsRouteTypes =
  | AdminRoute<projectsRoutes.projects>
  | AdminRoute<`${projectsRoutes.projects}/${projectsRoutes.new}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/ideas/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/set-up`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/input-tags`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/access-rights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/general/data`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}/demographics`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectAudience}/traffic`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectEvents}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectFiles}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsDescription}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectEvents}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessaging}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingNew}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingEdit}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectMessagingShow}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectSettingsTags}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/${projectsRoutes.projectPhasesSetup}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/setup`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${projectsRoutes.new}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-results`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/polls`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/access-rights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/ideas`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/form`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/map`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/results`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/new`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/form/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form/edit`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/survey-form/edit?${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/volunteering/causes/${string}`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/emails`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/phases/${string}/insights`>
  | AdminRoute<`${projectsRoutes.projects}/${string}/analysis/${string}`>;

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
  path: projectsRoutes.projects,
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
  path: projectsRoutes.new,
  component: () => (
    <PageLoading>
      <AdminProjectNew />
    </PageLoading>
  ),
});

// Project idea preview
const projectIdeaPreviewRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: projectsRoutes.projectIdeaId,
  component: () => (
    <PageLoading>
      <AdminProjectIdeaPreviewIndex />
    </PageLoading>
  ),
});

// --- Single project layout ---
const projectRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: projectsRoutes.projectId,
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
  path: projectsRoutes.projectGeneral,
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
  path: projectsRoutes.projectGeneralInputTags,
  component: () => <AdminAllowedTopicsComponent />,
});

const projectGeneralAccessRightsRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: projectsRoutes.projectGeneralAccessRights,
  component: () => (
    <PageLoading>
      <AdminProjectPermissions />
    </PageLoading>
  ),
});

const projectGeneralDataRoute = createRoute({
  getParentRoute: () => projectGeneralRoute,
  path: projectsRoutes.projectGeneralData,
  component: () => (
    <PageLoading>
      <AdminProjectsData />
    </PageLoading>
  ),
});

// --- Audience layout ---
const projectAudienceRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectAudience,
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
  path: projectsRoutes.projectMessaging,
  component: () => (
    <PageLoading>
      <ProjectMessaging />
    </PageLoading>
  ),
});

const projectMessagingNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectMessagingNew,
  component: () => (
    <PageLoading>
      <ProjectMessagingNew />
    </PageLoading>
  ),
});

const projectMessagingEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectMessagingEdit,
  component: () => (
    <PageLoading>
      <ProjectMessagingEdit />
    </PageLoading>
  ),
});

const projectMessagingShowRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectMessagingShow,
  component: () => (
    <PageLoading>
      <ProjectMessagingShow />
    </PageLoading>
  ),
});

// --- Analysis route ---
const projectAnalysisRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectAnalysis,
  component: () => (
    <PageLoading>
      <AdminProjectAnalysis />
    </PageLoading>
  ),
});

// --- Files route ---
const projectFilesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectFiles,
  component: () => (
    <PageLoading>
      <AdminProjectFiles />
    </PageLoading>
  ),
});

// --- Events routes ---
const projectEventsRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectEvents,
  component: () => (
    <PageLoading>
      <AdminProjectEvents />
    </PageLoading>
  ),
});

const projectEventsNewRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectEventsNew,
  component: () => (
    <PageLoading>
      <AdminProjectEventsEdit />
    </PageLoading>
  ),
});

const projectEventsEditRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectEventsId,
  component: () => (
    <PageLoading>
      <AdminProjectEventsEdit />
    </PageLoading>
  ),
});

// --- Phases layout ---
const projectPhasesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: projectsRoutes.projectIdPhases,
  component: () => (
    <PageLoading>
      <AdminProjectPhaseIndex />
    </PageLoading>
  ),
});

const phasesSetupRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhasesSetup,
  component: () => (
    <PageLoading>
      <AdminPhaseNewAndEdit />
    </PageLoading>
  ),
});

const phaseSetupRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseSetup,
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
  path: projectsRoutes.new,
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
  path: projectsRoutes.projectPhase,
  component: () => (
    <PageLoading>
      <AdminPhaseNewAndEdit />
    </PageLoading>
  ),
});

const phaseExternalSurveyResultsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseExternalSurveyResults,
  component: () => (
    <PageLoading>
      <AdminProjectSurveyResults />
    </PageLoading>
  ),
});

const phasePollsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhasePolls,
  component: () => (
    <PageLoading>
      <AdminProjectPoll />
    </PageLoading>
  ),
});

const phaseAccessRightsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseAccessRights,
  component: () => (
    <PageLoading>
      <AdminPhasePermissions />
    </PageLoading>
  ),
});

const phaseEmailsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseEmails,
  component: () => (
    <PageLoading>
      <AdminPhaseEmails />
    </PageLoading>
  ),
});

const phaseEmailsCampaignEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseEmailsCampaignEdit,
  component: () => <EmailsEdit campaignType="automated" />,
});

const phaseIdeasRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseIdeas,
  component: () => (
    <PageLoading>
      <AdminProjectIdeas />
    </PageLoading>
  ),
});

const phaseIdeaFormRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseIdeaForm,
  component: () => (
    <PageLoading>
      <AdminProjectIdeaForm />
    </PageLoading>
  ),
});

const phaseProposalsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseProposals,
  component: () => (
    <PageLoading>
      <AdminProjectProposals />
    </PageLoading>
  ),
});

const phaseVolunteeringRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseVolunteering,
  component: () => (
    <PageLoading>
      <AdminProjectVolunteering />
    </PageLoading>
  ),
});

const phaseMapRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseMap,
  component: () => (
    <PageLoading>
      <AdminCustomMapConfigComponent />
    </PageLoading>
  ),
});

const phaseVolunteeringNewCauseRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseVolunteeringNewCause,
  component: () => (
    <PageLoading>
      <AdminProjectVolunteeringNew />
    </PageLoading>
  ),
});

const phaseNativeSurveyResultsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseNativeSurveyResults,
  component: () => (
    <PageLoading>
      <AdminProjectsSurvey />
    </PageLoading>
  ),
});

const phaseSurveyFormRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseSurveyForm,
  component: () => (
    <PageLoading>
      <AdminPhaseSurveyFormTabPanel />
    </PageLoading>
  ),
});

const phaseIdeaFormEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseIdeaFormEdit,
  component: () => (
    <PageLoading>
      <IdeaFormBuilder />
    </PageLoading>
  ),
});

const phaseNativeSurveyFormEditRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseNativeSurveyFormEdit,
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
  path: projectsRoutes.projectPhaseVolunteeringCause,
  component: () => (
    <PageLoading>
      <AdminProjectVolunteeringEdit />
    </PageLoading>
  ),
});

const phaseInputImporterRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseInputImporter,
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
  path: projectsRoutes.projectPhaseReport,
  component: () => (
    <PageLoading>
      <ReportTab />
    </PageLoading>
  ),
});

const phaseInsightsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: projectsRoutes.projectPhaseInsights,
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
