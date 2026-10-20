import { defineMessages } from 'react-intl';

export default defineMessages({
  buildView: {
    id: 'app.containers.Admin.projects.project.buildView',
    defaultMessage: 'Build',
  },
  manageView: {
    id: 'app.containers.Admin.projects.project.manageView',
    defaultMessage: 'Manage',
  },
  insightsView: {
    id: 'app.containers.Admin.projects.project.insightsView',
    defaultMessage: 'Insights',
  },
  projectsCrumb: {
    id: 'app.containers.Admin.projects.project.projectsCrumb',
    defaultMessage: 'Projects',
  },
  projectSetupPanel: {
    id: 'app.containers.Admin.projects.project.projectSetupPanel',
    defaultMessage: 'Project setup',
  },
  projectSettings: {
    id: 'app.containers.Admin.projects.project.projectSettings',
    defaultMessage: 'Project settings',
  },
  previewProject: {
    id: 'app.containers.Admin.projects.project.previewProject',
    defaultMessage: 'Preview the project page',
  },
  backToProjectSetup: {
    id: 'app.containers.Admin.projects.project.backToProjectSetup',
    defaultMessage: 'Project setup',
  },
  offlineCollection: {
    id: 'app.containers.Admin.projects.project.offlineCollection',
    defaultMessage: 'Offline collection',
  },
  phasePreviewTitle: {
    id: 'app.containers.Admin.projects.project.phasePreviewTitle',
    defaultMessage: 'Preview of this phase',
  },
  noInputToManage: {
    id: 'app.containers.Admin.projects.project.noInputToManage',
    defaultMessage:
      'This phase collects no input, so there is nothing to manage.',
  },
  noInputToAnalyse: {
    id: 'app.containers.Admin.projects.project.noInputToAnalyse',
    defaultMessage:
      'This phase collects no input, so there is nothing to analyse.',
  },
  surveyResponsesInInsights: {
    id: 'app.containers.Admin.projects.project.surveyResponsesInInsights',
    defaultMessage:
      'Survey responses are not managed here. Open Insights to see them.',
  },
  externalToolToManage: {
    id: 'app.containers.Admin.projects.project.externalToolToManage',
    defaultMessage:
      'Responses are collected in the external tool you linked, so they cannot be managed here.',
  },
  externalToolToAnalyse: {
    id: 'app.containers.Admin.projects.project.externalToolToAnalyse',
    defaultMessage:
      'Results are collected in the external tool you linked, so they cannot be analysed here.',
  },
  notifications: {
    id: 'app.containers.Admin.projects.project.notifications',
    defaultMessage: 'Notifications',
  },
  surveyForm: {
    id: 'app.containers.Admin.projects.project.surveyForm',
    defaultMessage: 'Survey form',
  },
  mapConfiguration: {
    id: 'app.containers.Admin.projects.project.mapConfiguration',
    defaultMessage: 'Map configuration',
  },
  eventsSection: {
    id: 'app.containers.Admin.projects.project.eventsSection',
    defaultMessage: 'Events',
  },
  participationMethods: {
    id: 'app.containers.Admin.projects.project.participationMethods',
    defaultMessage: 'Participation methods',
  },
  newEvent: {
    id: 'app.containers.Admin.projects.project.newEvent',
    defaultMessage: 'New event',
  },
  filesSection: {
    id: 'app.containers.Admin.projects.project.filesSection',
    defaultMessage: '360 Input',
  },
  tagsRequiredInfo: {
    id: 'app.containers.Admin.projects.project.tagsRequiredInfo',
    defaultMessage:
      "At least one tag is required. To skip tags, remove the 'Tags' item from any phase's form.",
  },
  filesDescription: {
    id: 'app.containers.Admin.projects.project.filesDescription2',
    defaultMessage:
      'Files about this project, such as reports, plans and images. Attach them to the project, its phases and events, or add them as context to AI analysis.',
  },
  filesCount: {
    id: 'app.containers.Admin.projects.project.filesCount',
    defaultMessage: '{count, plural, one {# file} other {# files}}',
  },
  addFiles: {
    id: 'app.containers.Admin.projects.project.addFiles',
    defaultMessage: 'Add files',
  },
  dropFilesHereOr: {
    id: 'app.containers.Admin.projects.project.dropFilesHereOr',
    defaultMessage: 'Drop files here or',
  },
  supportedFileTypes: {
    id: 'app.containers.Admin.projects.project.supportedFileTypes',
    defaultMessage:
      'All file types are supported, such as audio (WAV, MP3), documents (PDF, DOCX, PPTX) and images (PNG, JPG).',
  },
  filesCountWithSize: {
    id: 'app.containers.Admin.projects.project.filesCountWithSize',
    defaultMessage: '{count, plural, one {# file} other {# files}} · {size}',
  },
  fileUploading: {
    id: 'app.containers.Admin.projects.project.fileUploading',
    defaultMessage: 'Uploading',
  },
  fileUploadFailed: {
    id: 'app.containers.Admin.projects.project.fileUploadFailed',
    defaultMessage: 'Upload failed',
  },
  removeFile: {
    id: 'app.containers.Admin.projects.project.removeFile',
    defaultMessage: 'Remove {fileName}',
  },
  fileActions: {
    id: 'app.containers.Admin.projects.project.fileActions',
    defaultMessage: 'Actions for {fileName}',
  },
  messagingSection: {
    id: 'app.containers.Admin.projects.project.messagingSection',
    defaultMessage: 'Messaging',
  },
  getStarted: {
    id: 'app.containers.Admin.projects.project.getStarted',
    defaultMessage: 'Get started',
  },
  stepsDone: {
    id: 'app.containers.Admin.projects.project.stepsDone',
    defaultMessage: '{done} of {total} done',
  },
  stepEditProjectPage: {
    id: 'app.containers.Admin.projects.project.stepEditProjectPage',
    defaultMessage: 'Edit the project page',
  },
  stepConfigureProjectSettings: {
    id: 'app.containers.Admin.projects.project.stepConfigureProjectSettings',
    defaultMessage: 'Configure project settings',
  },
  stepAddPhaseOrSurvey: {
    id: 'app.containers.Admin.projects.project.stepAddPhaseOrSurvey',
    defaultMessage: 'Add a phase or survey',
  },
  nextActions: {
    id: 'app.containers.Admin.projects.project.nextActions',
    defaultMessage: 'Next actions',
  },
  collectingNow: {
    id: 'app.containers.Admin.projects.project.collectingNow',
    defaultMessage: 'Collecting now',
  },
  participantsGraphLabel: {
    id: 'app.containers.Admin.projects.project.participantsGraphLabel',
    defaultMessage: 'Participants',
  },
  participantsGraphLastPeriod: {
    id: 'app.containers.Admin.projects.project.participantsGraphLastPeriod',
    defaultMessage: '<b>+{count}</b> last 7 days',
  },
  participantsGraphScale: {
    id: 'app.containers.Admin.projects.project.participantsGraphScale',
    defaultMessage: 'Weekly, since {date}',
  },
  actionMessageParticipants: {
    id: 'app.containers.Admin.projects.project.actionMessageParticipants',
    defaultMessage: 'Message participants',
  },
  stepPublishProject: {
    id: 'app.containers.Admin.projects.project.stepPublishProject',
    defaultMessage: 'Publish project',
  },
  newPhaseCrumb: {
    id: 'app.containers.Admin.projects.project.newPhaseCrumb',
    defaultMessage: 'New phase',
  },
  newSurveyCrumb: {
    id: 'app.containers.Admin.projects.project.newSurveyCrumb',
    defaultMessage: 'New survey',
  },
  selectMethodContinue: {
    id: 'app.containers.Admin.projects.project.selectMethodContinue',
    defaultMessage: 'Continue',
  },
  addQuestions: {
    id: 'app.containers.Admin.projects.project.addQuestions',
    defaultMessage: 'Add questions',
  },
  informationCollected: {
    id: 'app.containers.Admin.projects.project.informationCollected',
    defaultMessage: 'Information collected from participants',
  },
  continueToTheForm: {
    id: 'app.containers.Admin.projects.project.continueToTheForm',
    defaultMessage: 'Continue to the form',
  },
  saveToEditForm: {
    id: 'app.containers.Admin.projects.project.saveToEditForm',
    defaultMessage: 'Save the phase to add questions and import offline input.',
  },
  saveToEditSettings: {
    id: 'app.containers.Admin.projects.project.saveToEditSettings',
    defaultMessage:
      'Access rights, notifications and other settings become available once you save the phase.',
  },
  publishButton: {
    id: 'app.containers.Admin.projects.project.publishButton',
    defaultMessage: 'Publish',
  },
  publishButtonLive: {
    id: 'app.containers.Admin.projects.project.publishButtonLive',
    defaultMessage: 'Live',
  },
  publishStateDraft: {
    id: 'app.containers.Admin.projects.project.publishStateDraft',
    defaultMessage: 'Not published yet',
  },
  publishStateScheduled: {
    id: 'app.containers.Admin.projects.project.publishStateScheduled',
    defaultMessage: 'Scheduled',
  },
  publishStateScheduledAt: {
    id: 'app.containers.Admin.projects.project.publishStateScheduledAt',
    defaultMessage: 'Scheduled for {date} at {time}',
  },
  publishStatePublished: {
    id: 'app.containers.Admin.projects.project.publishStatePublished',
    defaultMessage: 'Published',
  },
  publishStateArchived: {
    id: 'app.containers.Admin.projects.project.publishStateArchived',
    defaultMessage: 'Archived',
  },
  publishSendEmail: {
    id: 'app.containers.Admin.projects.project.publishSendEmail',
    defaultMessage: 'Send a "Project published" email',
  },
  publishEmailRecipients: {
    id: 'app.containers.Admin.projects.project.publishEmailRecipients',
    defaultMessage:
      '\u2248 {count} recipients. Everyone who follows this project or has taken part will get it.',
  },
  publishEmailUnavailable: {
    id: 'app.containers.Admin.projects.project.publishEmailUnavailable',
    defaultMessage: 'Make the project public to email people about it.',
  },
  publishSchedule: {
    id: 'app.containers.Admin.projects.project.publishSchedule',
    defaultMessage: 'Schedule',
  },
  publishNow: {
    id: 'app.containers.Admin.projects.project.publishNow',
    defaultMessage: 'Publish now',
  },
  publishRestoreToDraft: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraft',
    defaultMessage: 'Restore to draft',
  },
  publishRestoreToDraftTitle: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftTitle',
    defaultMessage: 'Restore to draft?',
  },
  publishRestoreToDraftBody: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftBody',
    defaultMessage:
      'The project goes back to draft and is no longer visible to residents.',
  },
  publishCancel: {
    id: 'app.containers.Admin.projects.project.publishCancel',
    defaultMessage: 'Cancel',
  },
  publishMoveToArchive: {
    id: 'app.containers.Admin.projects.project.publishMoveToArchive',
    defaultMessage: 'Move to archive',
  },
  publishRestoreToDraftFromArchiveBody: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftFromArchiveBody',
    defaultMessage:
      'The project moves out of the archive and back to draft. It stays hidden from residents until you publish it again.',
  },
  publishArchiveTitle: {
    id: 'app.containers.Admin.projects.project.publishArchiveTitle',
    defaultMessage: 'Archive this project?',
  },
  publishArchiveBody: {
    id: 'app.containers.Admin.projects.project.publishArchiveBody',
    defaultMessage:
      'The project moves to your Archive folder on the platform. Residents can no longer see it or take part, and it stops appearing on the homepage, but everything stays saved and you can restore it to draft at any time.',
  },
  stepSharePrivateLink: {
    id: 'app.containers.Admin.projects.project.stepSharePrivateLink2',
    defaultMessage: 'Share a private link',
  },
  shareInvitePeople: {
    id: 'app.containers.Admin.projects.project.shareInvitePeople',
    defaultMessage: 'Invite people',
  },
  shareInvitePlaceholder: {
    id: 'app.containers.Admin.projects.project.shareInvitePlaceholder',
    defaultMessage: 'Email, separated by commas',
  },
  shareInvite: {
    id: 'app.containers.Admin.projects.project.shareInvite',
    defaultMessage: 'Invite',
  },
  sharePeopleWithAccess: {
    id: 'app.containers.Admin.projects.project.sharePeopleWithAccess',
    defaultMessage: 'People with access',
  },
  shareYou: {
    id: 'app.containers.Admin.projects.project.shareYou',
    defaultMessage: 'you',
  },
  shareRoleOwner: {
    id: 'app.containers.Admin.projects.project.shareRoleOwner',
    defaultMessage: 'Owner',
  },
  shareRoleManager: {
    id: 'app.containers.Admin.projects.project.shareRoleManager',
    defaultMessage: 'Manager',
  },
  shareRolePending: {
    id: 'app.containers.Admin.projects.project.shareRolePending',
    defaultMessage: 'Pending',
  },
  sharePreviewExplanation: {
    id: 'app.containers.Admin.projects.project.sharePreviewExplanation',
    defaultMessage:
      "Residents can't take part until you publish. Meanwhile, share a preview link so colleagues can see the project and give feedback.",
  },
  sharePreviewLink: {
    id: 'app.containers.Admin.projects.project.sharePreviewLink',
    defaultMessage: 'Share a preview link',
  },
  settingsGeneral: {
    id: 'app.containers.Admin.projects.project.settingsGeneral2',
    defaultMessage: 'General information',
  },
  settingsResources: {
    id: 'app.containers.Admin.projects.project.settingsResources',
    defaultMessage: 'Resources',
  },
  listing: {
    id: 'app.containers.Admin.projects.project.listing',
    defaultMessage: 'Listing',
  },
  topicTags: {
    id: 'app.containers.Admin.projects.project.topicTags',
    defaultMessage: 'Topic tags',
  },
  settingsTitle: {
    id: 'app.containers.Admin.projects.project.settingsTitle',
    defaultMessage: 'Settings',
  },
  settingsSave: {
    id: 'app.containers.Admin.projects.project.settingsSave',
    defaultMessage: 'Save',
  },
  settingsSaveFailed: {
    id: 'app.containers.Admin.projects.project.settingsSaveFailed',
    defaultMessage: "Some changes couldn't be saved. Click Save to try again.",
  },
  settingsProjectGroup: {
    id: 'app.containers.Admin.projects.project.settingsProjectGroup',
    defaultMessage: 'Project',
  },
  settingsInputsGroup: {
    id: 'app.containers.Admin.projects.project.settingsInputsGroup',
    defaultMessage: 'Inputs',
  },
  settingsTags: {
    id: 'app.containers.Admin.projects.project.settingsTags',
    defaultMessage: 'Tags',
  },
  settingsPerspectives: {
    id: 'app.containers.Admin.projects.project.settingsPerspectives',
    defaultMessage: 'Perspectives',
  },
  reorderTag: {
    id: 'app.containers.Admin.projects.project.reorderTag',
    defaultMessage: 'Drag to reorder {tagName}',
  },
  toggleSubtags: {
    id: 'app.containers.Admin.projects.project.toggleSubtags',
    defaultMessage: 'Show subtags of {tagName}',
  },
  settingsProjectName: {
    id: 'app.containers.Admin.projects.project.settingsProjectName',
    defaultMessage: 'Project name',
  },
  settingsProjectUrl: {
    id: 'app.containers.Admin.projects.project.settingsProjectUrl',
    defaultMessage: 'Project URL',
  },
  settingsProjectContext: {
    id: 'app.containers.Admin.projects.project.settingsProjectContext',
    defaultMessage: 'Project context',
  },
  settingsClearParticipationData: {
    id: 'app.containers.Admin.projects.project.settingsClearParticipationData',
    defaultMessage: 'Clear participation data',
  },
  settingsReset: {
    id: 'app.containers.Admin.projects.project.settingsReset',
    defaultMessage: 'Reset',
  },
  resetDataModalTitle: {
    id: 'app.containers.Admin.projects.project.resetDataModalTitle',
    defaultMessage: 'Reset all participation data?',
  },
  resetDataModalDescription: {
    id: 'app.containers.Admin.projects.project.resetDataModalDescription',
    defaultMessage:
      'This permanently deletes all inputs, comments, votes, reactions, survey and poll responses, volunteers and event registrants from this project. This can’t be undone.',
  },
  resetDataConfirmationWord: {
    id: 'app.containers.Admin.projects.project.resetDataConfirmationWord',
    defaultMessage: 'Reset',
  },
  resetDataButton: {
    id: 'app.containers.Admin.projects.project.resetDataButton',
    defaultMessage: 'Reset data',
  },
  settingsCreateAndManageTags: {
    id: 'app.containers.Admin.projects.project.settingsCreateAndManageTags',
    defaultMessage: 'Create and manage',
  },
  settingsAddTag: {
    id: 'app.containers.Admin.projects.project.settingsAddTag',
    defaultMessage: 'Add tag',
  },
  manageFiles: {
    id: 'app.containers.Admin.projects.project.manageFiles',
    defaultMessage: 'Manage files',
  },
  settingsSaveChanges: {
    id: 'app.containers.Admin.projects.project.settingsSaveChanges',
    defaultMessage: 'Save changes',
  },
  placementTimeline: {
    id: 'app.containers.Admin.projects.project.placementTimeline',
    defaultMessage: 'Timeline',
  },
  placementStandalone: {
    id: 'app.containers.Admin.projects.project.placementStandalone',
    defaultMessage: 'Standalone',
  },
  placementTimelineDescription: {
    id: 'app.containers.Admin.projects.project.placementTimelineDescription',
    defaultMessage: 'Runs as a phase, in the order you set.',
  },
  placementStandaloneDescription: {
    id: 'app.containers.Admin.projects.project.placementStandaloneDescription',
    defaultMessage: 'Runs on its own, outside the timeline.',
  },
  switchLockedResponses: {
    id: 'app.containers.Admin.projects.project.switchLockedResponses',
    defaultMessage:
      'This phase already has responses, so the kind of survey can no longer change.',
  },
  switchLockedPollQuestions: {
    id: 'app.containers.Admin.projects.project.switchLockedPollQuestions',
    defaultMessage:
      'This poll already has questions. Delete them first to use another kind of survey.',
  },
  switchSurveyMethodTitle: {
    id: 'app.containers.Admin.projects.project.switchSurveyMethodTitle',
    defaultMessage: 'Change the kind of survey?',
  },
  switchSurveyMethodIntro: {
    id: 'app.containers.Admin.projects.project.switchSurveyMethodIntro',
    defaultMessage:
      'The phase stays, but some of its setup does not carry over:',
  },
  switchLosesAccessSettings: {
    id: 'app.containers.Admin.projects.project.switchLosesAccessSettings',
    defaultMessage:
      'Access settings you changed for taking part in this phase are removed. The new kind of survey starts from the platform defaults.',
  },
  switchHidesSurveyForm: {
    id: 'app.containers.Admin.projects.project.switchHidesSurveyForm',
    defaultMessage:
      'The survey questions are hidden. They come back if you switch back to a survey.',
  },
  switchClearsEmbedUrl: {
    id: 'app.containers.Admin.projects.project.switchClearsEmbedUrl',
    defaultMessage: 'The external survey link is removed.',
  },
  switchChangesNotifications: {
    id: 'app.containers.Admin.projects.project.switchChangesNotifications',
    defaultMessage:
      'Notifications, insights and reports follow the new kind of survey.',
  },
  switchCancel: {
    id: 'app.containers.Admin.projects.project.switchCancel',
    defaultMessage: 'Cancel',
  },
  switchConfirm: {
    id: 'app.containers.Admin.projects.project.switchConfirm',
    defaultMessage: 'Change',
  },
  pollQuestions: {
    id: 'app.containers.Admin.projects.project.pollQuestions',
    defaultMessage: 'Poll questions',
  },
  inputsSection: {
    id: 'app.containers.Admin.projects.project.inputsSection',
    defaultMessage: 'Inputs',
  },
  causesSection: {
    id: 'app.containers.Admin.projects.project.causesSection',
    defaultMessage: 'Causes',
  },
  causesSectionDescription: {
    id: 'app.containers.Admin.projects.project.causesSectionDescription',
    defaultMessage: 'Set up the causes people can volunteer for.',
  },
  addIdeasFromPreviousPhase: {
    id: 'app.containers.Admin.projects.project.addIdeasFromPreviousPhase',
    defaultMessage: 'Add ideas from previous phase',
  },
  addIdeasFromPreviousPhaseDescription: {
    id: 'app.containers.Admin.projects.project.addIdeasFromPreviousPhaseDescription',
    defaultMessage:
      'Pick a phase in the timeline, then drag its ideas onto this phase to use them as voting options.',
  },
  editAccess: {
    id: 'app.containers.Admin.projects.project.editAccess',
    defaultMessage: 'Edit access',
  },
  editAccessDescription: {
    id: 'app.containers.Admin.projects.project.editAccessDescription',
    defaultMessage:
      'You can specify who can take each action, and ask additional questions to participants to collect more information.',
  },
  savedLabel: {
    id: 'app.containers.Admin.projects.project.savedLabel',
    defaultMessage: 'Saved',
  },
  unsavedChangesTitle: {
    id: 'app.containers.Admin.projects.project.unsavedChangesTitle',
    defaultMessage: 'Unsaved changes',
  },
  unsavedChangesDescription2: {
    id: 'app.containers.Admin.projects.project.unsavedChangesDescription2',
    defaultMessage: 'You have unsaved changes. Leaving now discards them.',
  },
  unsavedChangesCancel: {
    id: 'app.containers.Admin.projects.project.unsavedChangesCancel',
    defaultMessage: 'Cancel',
  },
  discardChanges: {
    id: 'app.containers.Admin.projects.project.discardChanges',
    defaultMessage: 'Discard changes',
  },
  areaFilterDescription: {
    id: 'app.containers.Admin.projects.project.areaFilterDescription',
    defaultMessage:
      'Where this project surfaces when residents filter by their area.',
  },
  areaFilterAllAreas: {
    id: 'app.containers.Admin.projects.project.areaFilterAllAreas',
    defaultMessage: 'All areas',
  },
  areaFilterSelectedAreas: {
    id: 'app.containers.Admin.projects.project.areaFilterSelectedAreas',
    defaultMessage: 'Selected areas',
  },
  areaFilterChooseAreas: {
    id: 'app.containers.Admin.projects.project.areaFilterChooseAreas',
    defaultMessage: 'Choose which area filters it shows in',
  },
  noInputsYet: {
    id: 'app.containers.Admin.projects.project.noInputsYet',
    defaultMessage: 'No inputs yet',
  },
  noInputsYetDescription: {
    id: 'app.containers.Admin.projects.project.noInputsYetDescription',
    defaultMessage:
      'Inputs appear here as participants take part. You can follow each one and add the ones collected offline.',
  },
  noInsightsYet: {
    id: 'app.containers.Admin.projects.project.noInsightsYet',
    defaultMessage: 'No insights yet',
  },
  noInsightsYetDescription: {
    id: 'app.containers.Admin.projects.project.noInsightsYetDescription',
    defaultMessage:
      'As participants take part, this page shows participation over time, demographics and a summary of their input.',
  },
  recommendedActionsHint: {
    id: 'app.containers.Admin.projects.project.recommendedActionsHint',
    defaultMessage:
      'Recommended actions appear here once participants take part.',
  },
});
