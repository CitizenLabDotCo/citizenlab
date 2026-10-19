/**
 * Files that still import `moment` / `moment-timezone`, exempt from the
 * no-moment ESLint rule until they are migrated to `utils/dateFormat`.
 *
 * This list is the migration's to-do list: it only ever shrinks. When you
 * convert a file, delete its line. When it reaches the characterization tests
 * (which compare against moment on purpose and stay forever), the migration is
 * done and the rule can move into the base config.
 *
 * See app/utils/dateFormat.README.md for how to convert a call.
 */
module.exports = [
  'app/api/survey_results/utils.ts',
  // Dynamic `import('moment/dist/locale/xx')` in localeGetter — no static
  // import, so it is only caught by the no-restricted-syntax rule. Grep for
  // "from 'moment" will not find it; don't prune this line automatically.
  'app/containers/App/constants.ts',
  'app/components/EventPreviews/index.tsx',
  'app/components/ParticipationCTABars/EventsCTABar/index.tsx',
  'app/components/ProjectCard/index.tsx',
  'app/components/admin/ContentBuilder/LanguageProvider/index.tsx',
  'app/components/admin/Email/DraftCampaignRow.tsx',
  'app/components/admin/Email/SentCampaignRow.tsx',
  'app/components/admin/FormResults/FormResultsQuestion/MappingQuestions/components/ExportGeoJSONButton.tsx',
  'app/components/admin/FormResults/FormResultsQuestion/TextQuestion/Analysis/utils.ts',
  'app/components/admin/UserBlockModals/BlockUser.tsx',
  'app/containers/Admin/Moderation/ModerationRow.tsx',
  'app/containers/Admin/messaging/CustomEmails/Show/index.tsx',
  'app/containers/Admin/messaging/Edit/index.tsx',
  'app/containers/Admin/projects/project/events/index.tsx',
  'app/containers/Admin/projects/project/inputImporter/ReviewSection/IdeaList.tsx',
  'app/containers/Admin/projects/project/messaging/Show/index.tsx',
  'app/containers/Admin/projects/project/phase/PhaseHeader.tsx',
  'app/containers/Admin/projects/project/projectHeader/PublicationStatus.tsx',
  'app/containers/Admin/users/_shared/UserManager/UsersTable/UsersTableRow/index.tsx',
  'app/containers/App/index.tsx',
  'app/containers/DisabledAccount/index.tsx',
  'app/containers/EventsPage/EventsViewer/index.tsx',
  'app/containers/IdeasShow/components/ProposalInfo/components/CountDown.tsx',
  'app/containers/UsersShowPage/UserHeader.tsx',
  'app/modules/commercial/admin_project_templates/admin/components/UseTemplateModal.tsx',
  'app/utils/__characterization__/dateFormats.test.ts',
  'app/utils/__characterization__/momentVsFacade.test.ts',
  'app/utils/__characterization__/schedulingPrimitives.test.ts',
  'app/utils/dataUtils/binAge.ts',
  'app/utils/dateUtils.test.ts',
  'app/utils/dateUtils.ts',
  // Compares moment against the façade on purpose; drop when the last
  // moment-using helper in dateUtils.ts is converted.
  'app/utils/__characterization__/dateFormats.test.ts',
  'app/utils/__characterization__/momentVsFacade.test.ts',
  'app/utils/__characterization__/schedulingPrimitives.test.ts',
  'app/utils/__characterization__/timezoneHelpers.test.ts',
  'app/utils/patchMomentDeAtJanuary.test.ts',
  'app/utils/patchMomentDeAtJanuary.ts',
];
