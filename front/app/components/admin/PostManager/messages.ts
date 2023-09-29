import { defineMessages } from 'react-intl';

export default defineMessages({
  assignedToMe: {
    id: 'app.components.admin.PostManager.assignedToMe',
    defaultMessage: 'Assigned to me',
  },
  assignedTo: {
    id: 'app.components.admin.PostManager.assignedTo',
    defaultMessage: 'Assigned to {assigneeName}',
  },
  noOne: {
    id: 'app.components.admin.PostManager.noOne',
    defaultMessage: 'Unassigned',
  },
  inputManagerHeader: {
    id: 'app.components.admin.PostManager.inputManagerHeader',
    defaultMessage: 'Inputs',
  },
  inputsNeedFeedbackToggle: {
    id: 'app.components.admin.PostManager.inputsNeedFeedbackToggle',
    defaultMessage: 'Only show inputs that need feedback',
  },
  loseIdeaPhaseInfoConfirmation: {
    id: 'app.components.admin.PostManager.loseIdeaPhaseInfoConfirmation',
    defaultMessage:
      'Moving this input away from its current project will lose the information about its assigned phases. Do you want to proceed?',
  },
  title: {
    id: 'app.components.admin.PostManager.title',
    defaultMessage: 'Title',
  },
  assignee: {
    id: 'app.components.admin.PostManager.assignee',
    defaultMessage: 'Assignee',
  },
  publication_date: {
    id: 'app.components.admin.PostManager.publication_date',
    defaultMessage: 'Published on',
  },
  likes: {
    id: 'app.components.admin.PostManager.likes',
    defaultMessage: 'Likes',
  },
  reactions: {
    id: 'app.components.admin.PostManager.reactions',
    defaultMessage: 'Reactions',
  },
  votes: {
    id: 'app.components.admin.PostManager.votes',
    defaultMessage: 'Votes',
  },
  comments: {
    id: 'app.components.admin.PostManager.comments',
    defaultMessage: 'Comments',
  },
  dislikes: {
    id: 'app.components.admin.PostManager.dislikes',
    defaultMessage: 'Dislikes',
  },
  participatoryBudgettingPicks: {
    id: 'app.components.admin.PostManager.participatoryBudgettingPicks',
    defaultMessage: 'Picks',
  },
  timelineTab: {
    id: 'app.components.admin.PostManager.timelineTab',
    defaultMessage: 'Timeline',
  },
  timelineTabTooltipText: {
    id: 'app.components.admin.PostManager.timelineTabTooltipText',
    defaultMessage:
      'Drag and drop inputs to copy them to different project phases.',
  },
  topicsTab: {
    id: 'app.components.admin.PostManager.topicsTab',
    defaultMessage: 'Topics',
  },
  topicsTabTooltipText: {
    id: 'app.components.admin.PostManager.topicsTabTooltipText',
    defaultMessage: 'Add topics to an input using drag and drop.',
  },
  projectsTab: {
    id: 'app.components.admin.PostManager.projectsTab',
    defaultMessage: 'Projects',
  },
  projectsTabTooltipContent: {
    id: 'app.components.admin.PostManager.projectsTabTooltipContent',
    defaultMessage:
      'You can drag and drop posts to move them from one project to another. Note that for timeline projects, you will still need to add the post to a specific phase.',
  },
  statusesTab: {
    id: 'app.components.admin.PostManager.statusesTab',
    defaultMessage: 'Status',
  },
  statusesTabTooltipContent: {
    id: 'app.components.admin.PostManager.statusesTabTooltipContent',
    defaultMessage:
      'Change the status of a post using drag and drop. The original author and other contributors will receive a notification of the changed status.',
  },
  pbItemCountTooltip: {
    id: 'app.components.admin.PostManager.pbItemCountTooltip',
    defaultMessage:
      "The number of times this has been included in other participants' participatory budgets",
  },
  exportAllInputs: {
    id: 'app.components.admin.PostManager.exportAllInputs',
    defaultMessage: 'Export all inputs (.xslx)',
  },
  exportInputsProjects: {
    id: 'app.components.admin.PostManager.exportInputsProjects',
    defaultMessage: 'Export inputs for this project (.xslx)',
  },
  exportSelectedInputs: {
    id: 'app.components.admin.PostManager.exportSelectedInputs',
    defaultMessage: 'Export selected inputs (.xslx)',
  },
  inputsExportFileName: {
    id: 'app.components.admin.PostManager.inputsExportFileName',
    defaultMessage: 'input',
  },
  inputCommentsExportFileName: {
    id: 'app.components.admin.PostManager.inputCommentsExportFileName',
    defaultMessage: 'input_comments',
  },
  exportIdeasComments: {
    id: 'app.components.admin.PostManager.exportIdeasComments',
    defaultMessage: 'Export all comments (.xslx)',
  },
  exportIdeasCommentsProjects: {
    id: 'app.components.admin.PostManager.exportIdeasCommentsProjects',
    defaultMessage: 'Export comments for this project (.xslx)',
  },
  exportSelectedInputsComments: {
    id: 'app.components.admin.PostManager.exportSelectedInputsComments',
    defaultMessage: 'Export comments for selected inputs (.xslx)',
  },
  exportInitiatives: {
    id: 'app.components.admin.PostManager.exportInitiatives',
    defaultMessage: 'Export all initiatives (.xslx)',
  },
  exportInitiativesProjects: {
    id: 'app.components.admin.PostManager.exportInitiativesProjects',
    defaultMessage: 'Export initiatives for this project (.xslx)',
  },
  exportSelectedInitiatives: {
    id: 'app.components.admin.PostManager.exportSelectedInitiatives',
    defaultMessage: 'Export selected initiatives (.xslx)',
  },
  initiativesExportFileName: {
    id: 'app.components.admin.PostManager.initiativesExportFileName',
    defaultMessage: 'proposals',
  },
  initiativesCommentsExportFileName: {
    id: 'app.components.admin.PostManager.initiativesCommentsExportFileName',
    defaultMessage: 'proposal_comments',
  },
  exportInitiativesComments: {
    id: 'app.components.admin.PostManager.exportInitiativesComments',
    defaultMessage: 'Export all comments (.xslx)',
  },
  exportSelectedInitiativesComments: {
    id: 'app.components.admin.PostManager.exportSelectedInitiativesComments',
    defaultMessage: 'Export comments for selected initiatives (.xslx)',
  },
  exports: {
    id: 'app.components.admin.PostManager.exports',
    defaultMessage: 'Exports',
  },
  noFilteredResults: {
    id: 'app.components.admin.PostManager.noFilteredResults',
    defaultMessage: 'The filters you selected did not return any results',
  },
  noInitiativesHere: {
    id: 'app.components.admin.PostManager.noInitiativesHere',
    defaultMessage: 'No initiatives match the current filters',
  },
  resetInputFiltersDescription: {
    id: 'app.components.admin.PostManager.resetInputFiltersDescription',
    defaultMessage: 'Reset the filters to see all inputs.',
  },
  resetFiltersButton: {
    id: 'app.components.admin.PostManager.resetFiltersButton',
    defaultMessage: 'Reset filters',
  },
  allProjects: {
    id: 'app.components.admin.PostManager.allProjects',
    defaultMessage: 'All projects',
  },
  allTopics: {
    id: 'app.components.admin.PostManager.allTopics',
    defaultMessage: 'All topics',
  },
  allStatuses: {
    id: 'app.components.admin.PostManager.allStatuses',
    defaultMessage: 'All statuses',
  },
  editStatuses: {
    id: 'app.components.admin.PostManager.editStatuses',
    defaultMessage: 'Edit statuses',
  },
  editTags: {
    id: 'app.components.admin.PostManager.editTags',
    defaultMessage: 'Edit tags',
  },
  editProjects: {
    id: 'app.components.admin.PostManager.editProjects',
    defaultMessage: 'Edit projects',
  },
  allPhases: {
    id: 'app.components.admin.PostManager.allPhases',
    defaultMessage: 'All phases',
  },
  oneInput: {
    id: 'app.components.admin.InputManager.onePost',
    defaultMessage: '1 input',
  },
  multipleInputs: {
    id: 'app.components.admin.PostManager.multipleInputs',
    defaultMessage: '{ideaCount} inputs',
  },
  oneInitiative: {
    id: 'app.components.admin.PostManager.oneInitiative',
    defaultMessage: '1 initiative',
  },
  multipleInitiatives: {
    id: 'app.components.admin.PostManager.multipleInitiatives',
    defaultMessage: '{initiativesCount} initiatives',
  },
  changeStatusModalTitle: {
    id: 'app.components.admin.PostManager.changeStatusModalTitle',
    defaultMessage: "Change this initiative's status",
  },
  statusChange: {
    id: 'app.components.admin.PostManager.statusChange',
    defaultMessage:
      "To change {initiativeTitle}'s status to {newStatus}, please provide feedback to the community.",
  },
  feedbackBodyPlaceholder: {
    id: 'app.components.admin.PostManager.feedbackBodyPlaceholder',
    defaultMessage: 'Justify this status change',
  },
  officialUpdateBody: {
    id: 'app.components.admin.PostManager.officialUpdateBody',
    defaultMessage: 'Justify this status change',
  },
  officialUpdateAuthor: {
    id: 'app.components.admin.PostManager.officialUpdateAuthor',
    defaultMessage: 'Choose how people will see your name',
  },
  feedbackAuthorPlaceholder: {
    id: 'app.components.admin.PostManager.feedbackAuthorPlaceholder',
    defaultMessage: 'Choose how people will see your name',
  },
  statusChangeSave: {
    id: 'app.components.admin.PostManager.statusChangeSave',
    defaultMessage: 'Change status',
  },
  statusChangeGenericError: {
    id: 'app.components.admin.PostManager.statusChangeGenericError',
    defaultMessage:
      'There was an error, please try again later or contact support.',
  },
  newFeedbackMode: {
    id: 'app.components.admin.PostManager.newFeedbackMode',
    defaultMessage: 'Write a new official update to explain this change',
  },
  latestFeedbackMode: {
    id: 'app.components.admin.PostManager.latestFeedbackMode',
    defaultMessage: 'Use the latest existing official update as an explanation',
  },
  automatic: {
    id: 'app.components.admin.PostManager.automatic',
    defaultMessage: '(automatic)',
  },
  inputs: {
    id: 'app.components.admin.PostManager.inputs',
    defaultMessage: 'inputs',
  },
  initiatives: {
    id: 'app.components.admin.PostManager.initiatives',
    defaultMessage: 'initiatives',
  },
  cost: {
    id: 'app.components.admin.PostManager.cost',
    defaultMessage: 'Cost',
  },
  participants: {
    id: 'app.components.admin.PostManager.participants',
    defaultMessage: 'Participants',
  },
  cosponsors: {
    id: 'app.components.admin.PostManager.cosponsors',
    defaultMessage: 'Cosponsors',
  },
});
