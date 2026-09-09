import { defineMessages } from 'react-intl';

export default defineMessages({
  buildView: {
    id: 'app.containers.Admin.projects.project.workspace.buildView',
    defaultMessage: 'Build',
  },
  manageView: {
    id: 'app.containers.Admin.projects.project.workspace.manageView',
    defaultMessage: 'Manage',
  },
  insightsView: {
    id: 'app.containers.Admin.projects.project.workspace.insightsView',
    defaultMessage: 'Insights',
  },
  projectsCrumb: {
    id: 'app.containers.Admin.projects.project.workspace.projectsCrumb',
    defaultMessage: 'Projects',
  },
  projectSetupPanel: {
    id: 'app.containers.Admin.projects.project.workspace.projectSetupPanel',
    defaultMessage: 'Project setup',
  },
  phaseSetupPanel: {
    id: 'app.containers.Admin.projects.project.workspace.phaseSetupPanel',
    defaultMessage: 'Phase setup',
  },
  projectSettings: {
    id: 'app.containers.Admin.projects.project.workspace.projectSettings',
    defaultMessage: 'Project settings',
  },
  phaseSettings: {
    id: 'app.containers.Admin.projects.project.workspace.phaseSettings',
    defaultMessage: 'Phase settings',
  },
  backToProjectSetup: {
    id: 'app.containers.Admin.projects.project.workspace.backToProjectSetup',
    defaultMessage: 'Project setup',
  },
  getStarted: {
    id: 'app.containers.Admin.projects.project.workspace.getStarted',
    defaultMessage: 'Get started',
  },
  stepsDone: {
    id: 'app.containers.Admin.projects.project.workspace.stepsDone',
    defaultMessage: '{done} of {total} done',
  },
  stepEditProjectPage: {
    id: 'app.containers.Admin.projects.project.workspace.stepEditProjectPage',
    defaultMessage: 'Edit the project page',
  },
  stepConfigureProjectSettings: {
    id: 'app.containers.Admin.projects.project.workspace.stepConfigureProjectSettings',
    defaultMessage: 'Configure project settings',
  },
  stepAddPhaseOrSurvey: {
    id: 'app.containers.Admin.projects.project.workspace.stepAddPhaseOrSurvey',
    defaultMessage: 'Add a phase or survey',
  },
  nextActions: {
    id: 'app.containers.Admin.projects.project.workspace.nextActions',
    defaultMessage: 'Next actions',
  },
  noParticipantsYet: {
    id: 'app.containers.Admin.projects.project.workspace.noParticipantsYet',
    defaultMessage: 'No participants yet',
  },
  participantCount: {
    id: 'app.containers.Admin.projects.project.workspace.participantCount',
    defaultMessage:
      '{count, plural, one {# participant} other {# participants}}',
  },
  actionNewIdeas: {
    id: 'app.containers.Admin.projects.project.workspace.actionNewIdeas',
    defaultMessage: 'New ideas',
  },
  actionMessageParticipants: {
    id: 'app.containers.Admin.projects.project.workspace.actionMessageParticipants',
    defaultMessage: 'Message participants',
  },
  actionCreateReport: {
    id: 'app.containers.Admin.projects.project.workspace.actionCreateReport',
    defaultMessage: 'Create report',
  },
  stepPublishProject: {
    id: 'app.containers.Admin.projects.project.workspace.stepPublishProject',
    defaultMessage: 'Publish project',
  },
  selectAMethod: {
    id: 'app.containers.Admin.projects.project.workspace.selectAMethod',
    defaultMessage: 'Select a method',
  },
  publishButton: {
    id: 'app.containers.Admin.projects.project.workspace.publishButton',
    defaultMessage: 'Publish',
  },
  publishButtonLive: {
    id: 'app.containers.Admin.projects.project.workspace.publishButtonLive',
    defaultMessage: 'Live',
  },
  publishStateDraft: {
    id: 'app.containers.Admin.projects.project.workspace.publishStateDraft',
    defaultMessage: 'Not published yet',
  },
  publishStateScheduled: {
    id: 'app.containers.Admin.projects.project.workspace.publishStateScheduled',
    defaultMessage: 'Scheduled',
  },
  publishStateScheduledAt: {
    id: 'app.containers.Admin.projects.project.workspace.publishStateScheduledAt',
    defaultMessage: 'Scheduled for {date} at {time}',
  },
  publishStatePublished: {
    id: 'app.containers.Admin.projects.project.workspace.publishStatePublished',
    defaultMessage: 'Published',
  },
  publishStateArchived: {
    id: 'app.containers.Admin.projects.project.workspace.publishStateArchived',
    defaultMessage: 'Archived',
  },
  publishWhoCanFind: {
    id: 'app.containers.Admin.projects.project.workspace.publishWhoCanFind',
    defaultMessage: 'Who can find it',
  },
  publishFindPublic: {
    id: 'app.containers.Admin.projects.project.workspace.publishFindPublic',
    defaultMessage: 'Public',
  },
  publishFindPublicDescription: {
    id: 'app.containers.Admin.projects.project.workspace.publishFindPublicDescription',
    defaultMessage:
      'Appears on the homepage, in the project list and in search.',
  },
  publishFindPrivate: {
    id: 'app.containers.Admin.projects.project.workspace.publishFindPrivate',
    defaultMessage: 'Private',
  },
  publishFindPrivateDescription: {
    id: 'app.containers.Admin.projects.project.workspace.publishFindPrivateDescription',
    defaultMessage:
      'Hidden from those places. Only people with the link can reach it.',
  },
  publishWhoCanOpen: {
    id: 'app.containers.Admin.projects.project.workspace.publishWhoCanOpen',
    defaultMessage: 'Who can open it',
  },
  publishOpenEveryone: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenEveryone',
    defaultMessage: 'Everyone',
  },
  publishOpenEveryoneDescription: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenEveryoneDescription',
    defaultMessage: 'Any resident can open it and take part.',
  },
  publishOpenAdmins: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenAdmins',
    defaultMessage: 'Admins & managers',
  },
  publishOpenAdminsDescription: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenAdminsDescription',
    defaultMessage: 'Only administrators and project managers.',
  },
  publishOpenGroups: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenGroups',
    defaultMessage: 'Selected groups',
  },
  publishOpenGroupsDescription: {
    id: 'app.containers.Admin.projects.project.workspace.publishOpenGroupsDescription',
    defaultMessage: 'Only people in the groups you choose.',
  },
  publishSendEmail: {
    id: 'app.containers.Admin.projects.project.workspace.publishSendEmail',
    defaultMessage: 'Send a "Project published" email',
  },
  publishEmailRecipients: {
    id: 'app.containers.Admin.projects.project.workspace.publishEmailRecipients',
    defaultMessage:
      '\u2248 {count} recipients. Everyone who follows this project or has taken part will get it.',
  },
  publishEmailUnavailable: {
    id: 'app.containers.Admin.projects.project.workspace.publishEmailUnavailable',
    defaultMessage: 'Make the project public to email people about it.',
  },
  publishSchedule: {
    id: 'app.containers.Admin.projects.project.workspace.publishSchedule',
    defaultMessage: 'Schedule',
  },
  publishNow: {
    id: 'app.containers.Admin.projects.project.workspace.publishNow',
    defaultMessage: 'Publish now',
  },
  stepSharePrivateLink: {
    id: 'app.containers.Admin.projects.project.workspace.stepSharePrivateLink2',
    defaultMessage: 'Share a private link',
  },
  shareInvitePeople: {
    id: 'app.containers.Admin.projects.project.workspace.shareInvitePeople',
    defaultMessage: 'Invite people',
  },
  shareInvitePlaceholder: {
    id: 'app.containers.Admin.projects.project.workspace.shareInvitePlaceholder',
    defaultMessage: 'Email, separated by commas',
  },
  shareInvite: {
    id: 'app.containers.Admin.projects.project.workspace.shareInvite',
    defaultMessage: 'Invite',
  },
  sharePeopleWithAccess: {
    id: 'app.containers.Admin.projects.project.workspace.sharePeopleWithAccess',
    defaultMessage: 'People with access',
  },
  shareYou: {
    id: 'app.containers.Admin.projects.project.workspace.shareYou',
    defaultMessage: 'you',
  },
  shareRoleOwner: {
    id: 'app.containers.Admin.projects.project.workspace.shareRoleOwner',
    defaultMessage: 'Owner',
  },
  shareRoleManager: {
    id: 'app.containers.Admin.projects.project.workspace.shareRoleManager',
    defaultMessage: 'Manager',
  },
  shareRolePending: {
    id: 'app.containers.Admin.projects.project.workspace.shareRolePending',
    defaultMessage: 'Pending',
  },
  sharePreviewExplanation: {
    id: 'app.containers.Admin.projects.project.workspace.sharePreviewExplanation',
    defaultMessage:
      "Residents can't take part until you publish. Meanwhile, share a preview link so colleagues can see the project and give feedback.",
  },
  sharePreviewLink: {
    id: 'app.containers.Admin.projects.project.workspace.sharePreviewLink',
    defaultMessage: 'Share a preview link',
  },
  settingsFrontOffice: {
    id: 'app.containers.Admin.projects.project.workspace.settingsFrontOffice',
    defaultMessage: 'Front office',
  },
  settingsGeneral: {
    id: 'app.containers.Admin.projects.project.workspace.settingsGeneral',
    defaultMessage: 'General',
  },
  settingsIdeaTags: {
    id: 'app.containers.Admin.projects.project.workspace.settingsIdeaTags',
    defaultMessage: 'Idea tags',
  },
  settingsReset: {
    id: 'app.containers.Admin.projects.project.workspace.settingsReset',
    defaultMessage: 'Reset',
  },
  settingsCancel: {
    id: 'app.containers.Admin.projects.project.workspace.settingsCancel',
    defaultMessage: 'Cancel',
  },
  settingsSaveChanges: {
    id: 'app.containers.Admin.projects.project.workspace.settingsSaveChanges',
    defaultMessage: 'Save changes',
  },
});
