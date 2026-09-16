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
  editSurveyForm: {
    id: 'app.containers.Admin.projects.project.editSurveyForm',
    defaultMessage: 'Edit survey form',
  },
  mapConfiguration: {
    id: 'app.containers.Admin.projects.project.mapConfiguration',
    defaultMessage: 'Map configuration',
  },
  eventsSection: {
    id: 'app.containers.Admin.projects.project.eventsSection',
    defaultMessage: 'Events',
  },
  filesSection: {
    id: 'app.containers.Admin.projects.project.filesSection',
    defaultMessage: '360 Input',
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
  noParticipantsYet: {
    id: 'app.containers.Admin.projects.project.noParticipantsYet',
    defaultMessage: 'No participants yet',
  },
  participantCount: {
    id: 'app.containers.Admin.projects.project.participantCount',
    defaultMessage:
      '{count, plural, one {# participant} other {# participants}}',
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
  publishWhoCanFind: {
    id: 'app.containers.Admin.projects.project.publishWhoCanFind',
    defaultMessage: 'Who can find it',
  },
  publishFindPublic: {
    id: 'app.containers.Admin.projects.project.publishFindPublic',
    defaultMessage: 'Public',
  },
  publishFindPublicDescription: {
    id: 'app.containers.Admin.projects.project.publishFindPublicDescription',
    defaultMessage:
      'Appears on the homepage, in the project list and in search.',
  },
  publishFindPrivate: {
    id: 'app.containers.Admin.projects.project.publishFindPrivate',
    defaultMessage: 'Private',
  },
  publishFindPrivateDescription: {
    id: 'app.containers.Admin.projects.project.publishFindPrivateDescription',
    defaultMessage:
      'Hidden from those places. Only people with the link can reach it.',
  },
  publishWhoCanOpen: {
    id: 'app.containers.Admin.projects.project.publishWhoCanOpen',
    defaultMessage: 'Who can open it',
  },
  publishOpenEveryone: {
    id: 'app.containers.Admin.projects.project.publishOpenEveryone',
    defaultMessage: 'Everyone',
  },
  publishOpenEveryoneDescription: {
    id: 'app.containers.Admin.projects.project.publishOpenEveryoneDescription',
    defaultMessage: 'Any resident can open it and take part.',
  },
  publishOpenAdmins: {
    id: 'app.containers.Admin.projects.project.publishOpenAdmins',
    defaultMessage: 'Admins & managers',
  },
  publishOpenAdminsDescription: {
    id: 'app.containers.Admin.projects.project.publishOpenAdminsDescription',
    defaultMessage: 'Only administrators and project managers.',
  },
  publishOpenGroups: {
    id: 'app.containers.Admin.projects.project.publishOpenGroups',
    defaultMessage: 'Selected groups',
  },
  publishOpenGroupsDescription: {
    id: 'app.containers.Admin.projects.project.publishOpenGroupsDescription',
    defaultMessage: 'Only people in the groups you choose.',
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
  settingsFrontOffice: {
    id: 'app.containers.Admin.projects.project.settingsFrontOffice',
    defaultMessage: 'Front office',
  },
  settingsGeneral: {
    id: 'app.containers.Admin.projects.project.settingsGeneral',
    defaultMessage: 'General',
  },
  settingsIdeaTags: {
    id: 'app.containers.Admin.projects.project.settingsIdeaTags',
    defaultMessage: 'Idea tags',
  },
  settingsReset: {
    id: 'app.containers.Admin.projects.project.settingsReset',
    defaultMessage: 'Reset',
  },
  settingsCancel: {
    id: 'app.containers.Admin.projects.project.settingsCancel',
    defaultMessage: 'Cancel',
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
});
