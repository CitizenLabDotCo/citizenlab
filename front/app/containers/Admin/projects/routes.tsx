import React, { lazy } from 'react';

import * as yup from 'yup';

import { reviewStates } from 'api/admin_publications/types';
import { ideaSortValues } from 'api/ideas/types';
import { projectSortableParams } from 'api/projects_mini_admin/types';

import PageLoading from 'components/UI/PageLoading';

import Navigate from 'utils/cl-router/Navigate';
import { parseModuleRoutes, RouteConfiguration } from 'utils/moduleUtils';
import { createRoute, useParams } from 'utils/router';

import { adminRoute } from '../routes';

const AdminProjectIdeaPreviewIndex = lazy(
  () => import('./AdminProjectIdeaPreviewIndex')
);
const IdeaFormBuilder = lazy(
  () => import('./project/inputForm/IdeaFormBuilder')
);
const SurveyFormBuilder = lazy(
  () => import('./project/surveyFormAssets/SurveyFormBuilder')
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
const AdminPhaseDescription = lazy(() => import('./project/phaseDescription'));
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

export const adminProjectsProjectLink = (projectId: string) =>
  ({
    to: '/admin/projects/$projectId',
    params: { projectId },
  } as const);

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

// Dynamic-key shape: the analysis route preserves these by not stripping
// unknown (see projectAnalysisRoute below). Custom-field UUIDs aren't known
// at compile time, so we model them as a template-literal index signature.
// Values come back via TanStack's default JSON-parsing search parser, so they
// may be string/number/array — typed as `unknown` to force callers to coerce.
type ProjectAnalysisDynamicKeys = {
  [K in
    | `author_custom_${string}`
    | `author_custom_${string}_from`
    | `author_custom_${string}_to`
    | `input_custom_${string}_from`
    | `input_custom_${string}_to`]?: unknown;
};

export type ProjectAnalysisSearchParams = yup.InferType<
  typeof projectAnalysisSearchSchema
> &
  ProjectAnalysisDynamicKeys;

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

// Projects index (list) - filter params for the project list page.
// Multiselect params (status, managers, etc.) are stored as JSON-encoded
// strings in the URL; the useParam/useParams hooks in _shared/params.ts
// handle parsing.
const projectsIndexSearchSchema = yup.object({
  tab: yup
    .string()
    .oneOf(['calendar', 'folders', 'spaces', 'ordering'])
    .optional(),
  sort: yup.string().oneOf(projectSortableParams).optional(),
  review_state: yup.string().oneOf(reviewStates).optional(),
  search: yup.string().optional(),
  min_start_date: yup.string().optional(),
  max_start_date: yup.string().optional(),
  // Array params encoded as ?key=["a","b"] in the URL — TanStack's default
  // parser turns them into arrays before validation.
  status: yup.array().of(yup.string().required()).optional(),
  managers: yup.array().of(yup.string().required()).optional(),
  participation_states: yup.array().of(yup.string().required()).optional(),
  folder_ids: yup.array().of(yup.string().required()).optional(),
  participation_methods: yup.array().of(yup.string().required()).optional(),
  visibility: yup.array().of(yup.string().required()).optional(),
  discoverability: yup.array().of(yup.string().required()).optional(),
  space_ids: yup.array().of(yup.string().required()).optional(),
});

const projectsIndexRoute = createRoute({
  getParentRoute: () => projectsRoute,
  path: '/',
  validateSearch: (search: Record<string, unknown>) =>
    projectsIndexSearchSchema.validateSync(search, { stripUnknown: true }),
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
const ProjectIndexRedirect = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId',
  });
  return (
    <Navigate
      to="/admin/projects/$projectId/phases/setup"
      params={{ projectId }}
      replace
    />
  );
};

const projectIndexRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: '/',
  component: ProjectIndexRedirect,
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

const projectMessagingShowSearchSchema = yup.object({
  created: yup.string().optional(),
  updated: yup.string().optional(),
});

const projectMessagingShowRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'messaging/$campaignId',
  validateSearch: (search: Record<string, unknown>) =>
    projectMessagingShowSearchSchema.validateSync(search, {
      stripUnknown: true,
    }),
  component: () => (
    <PageLoading>
      <ProjectMessagingShow />
    </PageLoading>
  ),
});

// --- Analysis route ---
// Analysis filter params. The schema is permissive (no stripUnknown) because
// the URL also carries dynamic keys like `author_custom_<uuid>` and
// `input_custom_<uuid>_(from|to)` that can't be enumerated in advance.
const projectAnalysisSearchSchema = yup.object({
  phase_id: yup.string().optional(),
  selected_input_id: yup.string().optional(),
  search: yup.string().optional(),
  published_at_from: yup.string().optional(),
  published_at_to: yup.string().optional(),
  reactions_from: yup.string().optional(),
  reactions_to: yup.string().optional(),
  votes_from: yup.string().optional(),
  votes_to: yup.string().optional(),
  comments_from: yup.string().optional(),
  comments_to: yup.string().optional(),
  limit: yup.string().optional(),
  input_custom_field_no_empty_values: yup
    .string()
    .oneOf(['true', 'false'])
    .optional(),
  // `[null]` is a deliberate sentinel meaning "filter to inputs without tags"
  tag_ids: yup.array().of(yup.string().nullable().defined()).optional(),
  reset_filters: yup.string().optional(),
  from: yup.string().optional(),
});

const projectAnalysisRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'analysis/$analysisId',
  // Don't strip unknown — the URL also carries dynamic keys like
  // `author_custom_<uuid>` and `input_custom_<uuid>_(from|to)` that we want
  // to keep but can't enumerate in the schema.
  validateSearch: (
    search: Record<string, unknown>
  ): ProjectAnalysisSearchParams =>
    projectAnalysisSearchSchema.validateSync(search),
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
// Input manager search params (used by PostManager on ideas/proposals tabs).
// These are raw string params; the hook useInputManagerSearchParams parses them.
const phasesSearchSchema = yup.object({
  sort: yup.string().oneOf(ideaSortValues).optional(),
  page: yup.string().optional(),
  search: yup.string().optional(),
  status: yup.string().optional(),
  topics: yup.string().optional(),
  assignee: yup.string().optional(),
  feedback_needed: yup.string().oneOf(['true', 'false']).optional(),
  phase: yup.string().optional(),
  projects: yup.string().optional(),
  tab: yup
    .string()
    .oneOf(['topics', 'phases', 'projects', 'statuses'])
    .optional(),
  selected_idea_id: yup.string().optional(),
});

const projectPhasesRoute = createRoute({
  getParentRoute: () => projectRoute,
  path: 'phases',
  validateSearch: (search: Record<string, unknown>) =>
    phasesSearchSchema.validateSync(search, { stripUnknown: true }),
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

const phaseDescriptionRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/description',
  component: () => (
    <PageLoading>
      <AdminPhaseDescription />
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

const phaseInsightsSearchSchema = yup.object({
  votingClusterBy: yup.string().optional(),
});

const phaseInsightsRoute = createRoute({
  getParentRoute: () => projectPhasesRoute,
  path: '$phaseId/insights',
  validateSearch: (search: Record<string, unknown>) =>
    phaseInsightsSearchSchema.validateSync(search, { stripUnknown: true }),
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
        phaseDescriptionRoute,
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
