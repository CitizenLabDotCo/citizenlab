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
  nextActions: {
    id: 'app.containers.Admin.projects.project.nextActions',
    defaultMessage: 'Next actions',
  },
  collectingNow: {
    id: 'app.containers.Admin.projects.project.collectingNow',
    defaultMessage: 'Collecting now',
  },
  participation: {
    id: 'app.containers.Admin.projects.project.participation',
    defaultMessage: 'Participation',
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
  settingsManagement: {
    id: 'app.containers.Admin.projects.project.settingsManagement',
    defaultMessage: 'Management',
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
  areaFilterAllAreas: {
    id: 'app.containers.Admin.projects.project.areaFilterAllAreas',
    defaultMessage: 'All areas',
  },
  areaFilterSelectedAreas: {
    id: 'app.containers.Admin.projects.project.areaFilterSelectedAreas',
    defaultMessage: 'Selected areas',
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
  beforeYouPublish: {
    id: 'app.containers.Admin.projects.project.beforeYouPublish',
    defaultMessage: 'Before you publish',
  },
  readyToPublish: {
    id: 'app.containers.Admin.projects.project.readyToPublish',
    defaultMessage: 'Ready to publish',
  },
  readyForReview: {
    id: 'app.containers.Admin.projects.project.readyForReview',
    defaultMessage: 'Ready for review',
  },
  itemsReady: {
    id: 'app.containers.Admin.projects.project.itemsReady',
    defaultMessage: '{ready} of {total} ready',
  },
  scheduledToPublish: {
    id: 'app.containers.Admin.projects.project.scheduledToPublish',
    defaultMessage: 'Scheduled to publish on {date}',
  },
  itemReady: {
    id: 'app.containers.Admin.projects.project.itemReady',
    defaultMessage: 'Ready',
  },
  itemNotReady: {
    id: 'app.containers.Admin.projects.project.itemNotReady',
    defaultMessage: 'Not ready',
  },
  projectPageItem: {
    id: 'app.containers.Admin.projects.project.projectPageItem',
    defaultMessage: 'Project page',
  },
  editProjectPage: {
    id: 'app.containers.Admin.projects.project.editProjectPage',
    defaultMessage: 'Edit project page',
  },
  homepageCard: {
    id: 'app.containers.Admin.projects.project.homepageCard',
    defaultMessage: 'Homepage card',
  },
  areaItem: {
    id: 'app.containers.Admin.projects.project.areaItem',
    defaultMessage: 'Area',
  },
  areasCount: {
    id: 'app.containers.Admin.projects.project.areasCount',
    defaultMessage: '{count, plural, one {# area} other {# areas}}',
  },
  topicTagsCount: {
    id: 'app.containers.Admin.projects.project.topicTagsCount',
    defaultMessage: '{count, plural, one {# tag} other {# tags}}',
  },
  participantsEmpty: {
    id: 'app.containers.Admin.projects.project.participantsEmpty',
    defaultMessage: 'Numbers appear here once participants take part',
  },
  phaseUnitInputs: {
    id: 'app.containers.Admin.projects.project.phaseUnitInputs',
    defaultMessage: 'inputs',
  },
  phaseUnitResponses: {
    id: 'app.containers.Admin.projects.project.phaseUnitResponses',
    defaultMessage: 'responses',
  },
  phaseUnitVotes: {
    id: 'app.containers.Admin.projects.project.phaseUnitVotes',
    defaultMessage: 'votes',
  },
  archivedExplanation: {
    id: 'app.containers.Admin.projects.project.archivedExplanation',
    defaultMessage:
      'Residents can still see this project, but can no longer take part. Restore it to draft to keep working on it.',
  },
  finalRecord: {
    id: 'app.containers.Admin.projects.project.finalRecord',
    defaultMessage: 'Final record',
  },
  finalRecordRan: {
    id: 'app.containers.Admin.projects.project.finalRecordRan',
    defaultMessage: 'Ran',
  },
  finalRecordRanValue: {
    id: 'app.containers.Admin.projects.project.finalRecordRanValue',
    defaultMessage: '{start} to {end}',
  },
  finalRecordRanOpenEnded: {
    id: 'app.containers.Admin.projects.project.finalRecordRanOpenEnded',
    defaultMessage: 'Since {start}',
  },
  finalRecordPeople: {
    id: 'app.containers.Admin.projects.project.finalRecordPeople',
    defaultMessage: 'People',
  },
  finalRecordContributions: {
    id: 'app.containers.Admin.projects.project.finalRecordContributions',
    defaultMessage: 'Contributions',
  },
  finalRecordPhases: {
    id: 'app.containers.Admin.projects.project.finalRecordPhases',
    defaultMessage: 'Phases',
  },
  publishArchiveBody2: {
    id: 'app.containers.Admin.projects.project.publishArchiveBody2',
    defaultMessage:
      'The project moves to the archive. Residents can still see it and its results, but can no longer take part. Everything stays saved and you can restore it to draft at any time.',
  },
  publishRestoreToDraftBody2: {
    id: 'app.containers.Admin.projects.project.publishRestoreToDraftBody2',
    defaultMessage:
      'The project goes back to draft. Residents can no longer see it or take part. If projects need approval on this platform, it has to be approved again before you can publish it.',
  },
  homepageCardImage: {
    id: 'app.containers.Admin.projects.project.homepageCardImage',
    defaultMessage: 'Image',
  },
  homepageCardDescription: {
    id: 'app.containers.Admin.projects.project.homepageCardDescription',
    defaultMessage: 'Description',
  },
  homepageCardDescriptionPlaceholder: {
    id: 'app.containers.Admin.projects.project.homepageCardDescriptionPlaceholder',
    defaultMessage: 'Participants will see this on the homepage.',
  },
  areasSelectedCount: {
    id: 'app.containers.Admin.projects.project.areasSelectedCount',
    defaultMessage:
      '{count, plural, one {# area selected} other {# areas selected}}',
  },
  topicTagsSearch: {
    id: 'app.containers.Admin.projects.project.topicTagsSearch',
    defaultMessage: 'Search tags...',
  },
  topicTagsNoMatch: {
    id: 'app.containers.Admin.projects.project.topicTagsNoMatch',
    defaultMessage: 'No matching tags',
  },
  saveProjectSetup: {
    id: 'app.containers.Admin.projects.project.saveProjectSetup',
    defaultMessage: 'Save',
  },
  publishMissingTitle: {
    id: 'app.containers.Admin.projects.project.publishMissingTitle',
    defaultMessage: 'Publish project',
  },
  publishMissingBody: {
    id: 'app.containers.Admin.projects.project.publishMissingBody',
    defaultMessage:
      '{missing, plural, one {# of {total} essentials is not set yet. The project will go live without it, and you can add it later.} other {# of {total} essentials are not set yet. The project will go live without them, and you can add them later.}}',
  },
  publishMissingScheduleTitle: {
    id: 'app.containers.Admin.projects.project.publishMissingScheduleTitle',
    defaultMessage: 'Schedule project',
  },
  publishMissingScheduleConfirm: {
    id: 'app.containers.Admin.projects.project.publishMissingScheduleConfirm',
    defaultMessage: 'Continue to schedule',
  },
  publishMissingBack: {
    id: 'app.containers.Admin.projects.project.publishMissingBack',
    defaultMessage: 'Back to setup',
  },
  publishMissingConfirm: {
    id: 'app.containers.Admin.projects.project.publishMissingConfirm',
    defaultMessage: 'Publish',
  },
  generalInformation: {
    id: 'app.containers.Admin.projects.project.generalInformation',
    defaultMessage: 'General information',
  },
  projectDetails: {
    id: 'app.containers.Admin.projects.project.projectDetails',
    defaultMessage: 'Project details',
  },
  ideationSetup: {
    id: 'app.containers.Admin.projects.project.ideationSetup',
    defaultMessage: 'Ideation setup',
  },
  proposalsSetup: {
    id: 'app.containers.Admin.projects.project.proposalsSetup',
    defaultMessage: 'Proposals setup',
  },
  votingSetup: {
    id: 'app.containers.Admin.projects.project.votingSetup',
    defaultMessage: 'Voting setup',
  },
  surveySetup: {
    id: 'app.containers.Admin.projects.project.surveySetup',
    defaultMessage: 'Survey setup',
  },
  informationSetup: {
    id: 'app.containers.Admin.projects.project.informationSetup',
    defaultMessage: 'Information setup',
  },
  commonGroundSetup: {
    id: 'app.containers.Admin.projects.project.commonGroundSetup',
    defaultMessage: 'Common ground setup',
  },
  volunteeringSetup: {
    id: 'app.containers.Admin.projects.project.volunteeringSetup',
    defaultMessage: 'Volunteering setup',
  },
  documentAnnotationSetup: {
    id: 'app.containers.Admin.projects.project.documentAnnotationSetup',
    defaultMessage: 'Document annotation setup',
  },
  editReport: {
    id: 'app.containers.Admin.projects.project.editReport',
    defaultMessage: 'Edit report',
  },
  reportVisibleToParticipants: {
    id: 'app.containers.Admin.projects.project.reportVisibleToParticipants',
    defaultMessage: 'Visible to participants',
  },
  reportVisibility: {
    id: 'app.containers.Admin.projects.project.reportVisibility',
    defaultMessage: 'Report visibility',
  },
  reportVisible: {
    id: 'app.containers.Admin.projects.project.reportVisible',
    defaultMessage: 'Visible',
  },
  reportNotVisible: {
    id: 'app.containers.Admin.projects.project.reportNotVisible',
    defaultMessage: 'Not visible',
  },
  deleteReport: {
    id: 'app.containers.Admin.projects.project.deleteReport',
    defaultMessage: 'Delete report',
  },
  collectDemographicData: {
    id: 'app.containers.Admin.projects.project.collectDemographicData',
    defaultMessage: 'Collect demographic data',
  },
  collectDemographicDataDescription: {
    id: 'app.containers.Admin.projects.project.collectDemographicDataDescription',
    defaultMessage:
      'Decide which information you want to collect when participants take these actions.',
  },
  demographicsNotSet: {
    id: 'app.containers.Admin.projects.project.demographicsNotSet',
    defaultMessage: 'Not set',
  },
  editForm: {
    id: 'app.containers.Admin.projects.project.editForm',
    defaultMessage: 'Edit form',
  },
  takingSurveyAction: {
    id: 'app.containers.Admin.projects.project.takingSurveyAction',
    defaultMessage: 'Taking the survey',
  },
  takingPollAction: {
    id: 'app.containers.Admin.projects.project.takingPollAction',
    defaultMessage: 'Taking the poll',
  },
  annotatingDocumentAction: {
    id: 'app.containers.Admin.projects.project.annotatingDocumentAction',
    defaultMessage: 'Annotating the document',
  },
  inputTermDescription: {
    id: 'app.containers.Admin.projects.project.inputTermDescription',
    defaultMessage:
      'The word used for what participants send: in the form, the button and Manage.',
  },
  ideaFormTitle: {
    id: 'app.containers.Admin.projects.project.ideaFormTitle',
    defaultMessage: 'Idea form',
  },
  optionFormTitle: {
    id: 'app.containers.Admin.projects.project.optionFormTitle',
    defaultMessage: 'Option form',
  },
  projectFormTitle: {
    id: 'app.containers.Admin.projects.project.projectFormTitle',
    defaultMessage: 'Project form',
  },
  questionFormTitle: {
    id: 'app.containers.Admin.projects.project.questionFormTitle',
    defaultMessage: 'Question form',
  },
  issueFormTitle: {
    id: 'app.containers.Admin.projects.project.issueFormTitle',
    defaultMessage: 'Issue form',
  },
  contributionFormTitle: {
    id: 'app.containers.Admin.projects.project.contributionFormTitle',
    defaultMessage: 'Contribution form',
  },
  proposalFormTitle: {
    id: 'app.containers.Admin.projects.project.proposalFormTitle',
    defaultMessage: 'Proposal form',
  },
  initiativeFormTitle: {
    id: 'app.containers.Admin.projects.project.initiativeFormTitle',
    defaultMessage: 'Initiative form',
  },
  petitionFormTitle: {
    id: 'app.containers.Admin.projects.project.petitionFormTitle',
    defaultMessage: 'Petition form',
  },
  commentFormTitle: {
    id: 'app.containers.Admin.projects.project.commentFormTitle',
    defaultMessage: 'Comment form',
  },
  responseFormTitle: {
    id: 'app.containers.Admin.projects.project.responseFormTitle',
    defaultMessage: 'Response form',
  },
  suggestionFormTitle: {
    id: 'app.containers.Admin.projects.project.suggestionFormTitle',
    defaultMessage: 'Suggestion form',
  },
  topicFormTitle: {
    id: 'app.containers.Admin.projects.project.topicFormTitle',
    defaultMessage: 'Topic form',
  },
  postFormTitle: {
    id: 'app.containers.Admin.projects.project.postFormTitle',
    defaultMessage: 'Post form',
  },
  storyFormTitle: {
    id: 'app.containers.Admin.projects.project.storyFormTitle',
    defaultMessage: 'Story form',
  },
  observationFormTitle: {
    id: 'app.containers.Admin.projects.project.observationFormTitle',
    defaultMessage: 'Observation form',
  },
  ideasAndParticipantData: {
    id: 'app.containers.Admin.projects.project.ideasAndParticipantData',
    defaultMessage: 'Ideas and participant data',
  },
  proposalsAndParticipantData: {
    id: 'app.containers.Admin.projects.project.proposalsAndParticipantData',
    defaultMessage: 'Proposals and participant data',
  },
  addDescription: {
    id: 'app.containers.Admin.projects.project.addDescription',
    defaultMessage: 'Add a description',
  },
  attachments: {
    id: 'app.containers.Admin.projects.project.attachments',
    defaultMessage: 'Attachments',
  },
});
