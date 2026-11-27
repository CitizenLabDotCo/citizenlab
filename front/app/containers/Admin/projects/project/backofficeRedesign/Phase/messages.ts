import { defineMessages } from 'react-intl';

export default defineMessages({
  participantCommunications: {
    id: 'app.containers.Admin.projects.project.participantCommunications',
    defaultMessage: 'Emails and notifications',
  },
  goesLiveWithProject: {
    id: 'app.containers.Admin.projects.project.goesLiveWithProject',
    defaultMessage: 'Goes live when you publish the project.',
  },
  goToProject: {
    id: 'app.containers.Admin.projects.project.goToProject',
    defaultMessage: 'Go to project',
  },
  addReport: {
    id: 'app.containers.Admin.projects.project.phaseAddReport',
    defaultMessage: 'Add a report',
  },
  notificationsOnSummary: {
    id: 'app.containers.Admin.projects.project.notificationsOnSummary',
    defaultMessage: '{count} on',
  },
  participantCommunicationsDescription: {
    id: 'app.containers.Admin.projects.project.participantCommunicationsDescription',
    defaultMessage:
      'Participants get an email and a notification when any of these happens.',
  },
  manageEmpty: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.manageEmpty',
    defaultMessage: 'Once the project is live, you can review and manage {terms} here',
  },
  insightsEmpty: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsEmpty',
    defaultMessage:
      'Once the project is live, insights will help you turn participation into clear results',
  },
  insightsNoActivity: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsNoActivity',
    defaultMessage: 'No activity counted in this phase',
  },
  insightsCountsPhaseDates: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsCountsPhaseDates',
    defaultMessage:
      'Insights counts the visits and participation during the phase dates.',
  },
  insightsCountsPhaseDatesWithoutAdmins: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsCountsPhaseDatesWithoutAdmins',
    defaultMessage:
      'Insights counts the visits and participation during the phase dates. Admins and managers are left out, as set in the platform settings.',
  },
  insightsOnlyAdminActivity: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsOnlyAdminActivity',
    defaultMessage: 'Only admins and managers have taken part so far',
  },
  insightsLeavesOutAdmins: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsLeavesOutAdmins',
    defaultMessage:
      'Insights leaves out the visits and participation of admins and managers, as set in the platform settings.',
  },
  noParticipationInPhaseDates: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.noParticipationInPhaseDates',
    defaultMessage: 'No participation in the phase dates',
  },
  insightsCoversInputsInManage: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsCoversInputsInManage',
    defaultMessage: `{inputTerm, select,
      idea {Insights covers {dateRange}. Ideas added outside these dates are in the {manageLink}}
      option {Insights covers {dateRange}. Options added outside these dates are in the {manageLink}}
      project {Insights covers {dateRange}. Projects added outside these dates are in the {manageLink}}
      question {Insights covers {dateRange}. Questions added outside these dates are in the {manageLink}}
      issue {Insights covers {dateRange}. Issues added outside these dates are in the {manageLink}}
      contribution {Insights covers {dateRange}. Contributions added outside these dates are in the {manageLink}}
      proposal {Insights covers {dateRange}. Proposals added outside these dates are in the {manageLink}}
      initiative {Insights covers {dateRange}. Initiatives added outside these dates are in the {manageLink}}
      petition {Insights covers {dateRange}. Petitions added outside these dates are in the {manageLink}}
      comment {Insights covers {dateRange}. Comments added outside these dates are in the {manageLink}}
      response {Insights covers {dateRange}. Responses added outside these dates are in the {manageLink}}
      suggestion {Insights covers {dateRange}. Suggestions added outside these dates are in the {manageLink}}
      topic {Insights covers {dateRange}. Topics added outside these dates are in the {manageLink}}
      post {Insights covers {dateRange}. Posts added outside these dates are in the {manageLink}}
      story {Insights covers {dateRange}. Stories added outside these dates are in the {manageLink}}
      observation {Insights covers {dateRange}. Observations added outside these dates are in the {manageLink}}
      other {Insights covers {dateRange}. Inputs added outside these dates are in the {manageLink}}
    }`,
  },
  insightsCoversVotesInManage: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsCoversVotesInManage',
    defaultMessage:
      'Insights covers {dateRange}. Votes added outside these dates are in the {manageLink}',
  },
  insightsCoversResponsesExcluded: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.insightsCoversResponsesExcluded',
    defaultMessage:
      'Insights covers {dateRange}. Responses added outside these dates are not included',
  },
  manageTabLink: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.manageTabLink',
    defaultMessage: 'Manage tab',
  },
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
  phasePreviewTitle: {
    id: 'app.containers.Admin.projects.project.phasePreviewTitle',
    defaultMessage: 'Preview of this phase',
  },
  draftAccessTitle: {
    id: 'app.containers.Admin.projects.project.draftAccessTitle',
    defaultMessage: 'Who can take part',
  },
  saveFirstToEditAccess: {
    id: 'app.containers.Admin.projects.project.saveFirstToEditAccess',
    defaultMessage: 'Save the phase first to edit access',
  },
  editCommunications: {
    id: 'app.containers.Admin.projects.project.editCommunications',
    defaultMessage: 'Edit',
  },
  saveFirstToEditCommunications: {
    id: 'app.containers.Admin.projects.project.saveFirstToEditCommunications',
    defaultMessage: 'Save the phase first to edit emails and notifications',
  },
  saveFirstToAddQuestions: {
    id: 'app.containers.Admin.projects.project.saveFirstToAddQuestions',
    defaultMessage: 'Save the phase first to add questions',
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
  annotateSummary: {
    id: 'app.containers.Admin.projects.project.annotateSummary',
    defaultMessage: 'Annotate',
  },
  signUpSummary: {
    id: 'app.containers.Admin.projects.project.signUpSummary',
    defaultMessage: 'Sign up',
  },
  annotatingDocumentAction: {
    id: 'app.containers.Admin.projects.project.annotatingDocumentAction',
    defaultMessage: 'Annotating the document',
  },
  listLoadFailed: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.listLoadFailed',
    defaultMessage: 'Could not load this list.',
  },
  retryListLoad: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.Phase.retryListLoad',
    defaultMessage: 'Try again',
  },
});
