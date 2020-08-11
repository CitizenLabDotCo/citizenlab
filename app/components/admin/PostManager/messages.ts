import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.components.admin.PostManager.header',
    defaultMessage: 'Ideas',
  },
  anyFeedbackStatusIdeas: {
    id: 'app.components.admin.PostManager.anyFeedbackStatusIdeas',
    defaultMessage: 'All ideas',
  },
  anyFeedbackStatusInitiatives: {
    id: 'app.components.admin.PostManager.anyFeedbackStatusInitiatives',
    defaultMessage: 'All initiatives',
  },
  needFeedback: {
    id: 'app.components.admin.PostManager.needFeedback',
    defaultMessage: 'Need Feedback',
  },
  anyAssignment: {
    id: 'app.components.admin.PostManager.anyAssignment',
    defaultMessage: 'Any administrator',
  },
  assignedToMe: {
    id: 'app.components.admin.PostManager.assignedToMe',
    defaultMessage: 'Assigned to me',
  },
  delete: {
    id: 'app.components.admin.PostManager.delete',
    defaultMessage: 'Delete',
  },
  deleteAllSelectedIdeas: {
    id: 'app.components.admin.PostManager.deleteAllSelectedIdeas',
    defaultMessage: 'Delete {count} selected ideas',
  },
  deleteIdeaConfirmation: {
    id: 'app.components.admin.PostManager.deleteIdeaConfirmation',
    defaultMessage: 'Are you sure you want to delete this idea?',
  },
  deleteIdeasConfirmation: {
    id: 'app.components.admin.PostManager.deleteIdeasConfirmation',
    defaultMessage: 'Are you sure you want to delete {count} ideas?',
  },
  deleteAllSelectedInitiatives: {
    id: 'app.components.admin.PostManager.deleteAllSelectedInitiatives',
    defaultMessage: 'Delete {count} selected initiatives',
  },
  deleteInitiativeConfirmation: {
    id: 'app.components.admin.PostManager.deleteInitiativeConfirmation',
    defaultMessage: 'Are you sure you want to delete this initiative?',
  },
  deleteInitiativesConfirmation: {
    id: 'app.components.admin.PostManager.deleteInitiativesConfirmation',
    defaultMessage: 'Are you sure you want to delete {count} initiatives?',
  },
  losePhaseInfoConfirmation: {
    id: 'app.components.admin.PostManager.losePhaseInfoConfirmation',
    defaultMessage:
      "Moving '{ideaTitle}' away from its current project will lose the information about its assigned phases. Do you want to proceed?",
  },
  edit: {
    id: 'app.components.admin.PostManager.edit',
    defaultMessage: 'Edit',
  },
  assignedTo: {
    id: 'app.components.admin.PostManager.assignedTo',
    defaultMessage: 'Assigned to {assigneeName}',
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
  remainingTime: {
    id: 'app.components.admin.PostManager.remainingTime',
    defaultMessage: 'Days Remaining',
  },
  up: {
    id: 'app.components.admin.PostManager.up',
    defaultMessage: 'Up',
  },
  votes: {
    id: 'app.components.admin.PostManager.votes',
    defaultMessage: 'Votes',
  },
  comments: {
    id: 'app.components.admin.PostManager.comments',
    defaultMessage: 'Comments',
  },
  down: {
    id: 'app.components.admin.PostManager.down',
    defaultMessage: 'Down',
  },
  participatoryBudgettingPicks: {
    id: 'app.components.admin.PostManager.participatoryBudgettingPicks',
    defaultMessage: 'Picks',
  },
  multiDragAndDropHelpIdeas: {
    id: 'app.components.admin.PostManager.multiDragAndDropHelpIdeas',
    defaultMessage:
      'Drag and drop the ideas on an item above to assign them all at once.',
  },
  multiDragAndDropHelpInitiatives: {
    id: 'app.components.admin.PostManager.multiDragAndDropHelpInitiatives',
    defaultMessage:
      'Drag and drop the initiatives on an item above to assign them all at once.',
  },
  timelineTab: {
    id: 'app.components.admin.PostManager.timelineTab',
    defaultMessage: 'Timeline',
  },
  timelineTabTooltip: {
    id: 'app.components.admin.PostManager.timelineTabTooltip',
    defaultMessage:
      'Drag and drop selected ideas to the phase you want to add them to. By doing so, they will also remain in the current phase(s).',
  },
  topicsTab: {
    id: 'app.components.admin.PostManager.topicsTab',
    defaultMessage: 'Topics',
  },
  topicsTabTooltip: {
    id: 'app.components.admin.PostManager.topicsTabTooltip',
    defaultMessage:
      'Drag and drop selected ideas to the topic you want to assign them to. An idea can have any number of topics.',
  },
  projectsTab: {
    id: 'app.components.admin.PostManager.projectsTab',
    defaultMessage: 'Projects',
  },
  projectsTabTooltip: {
    id: 'app.components.admin.PostManager.projectsTabTooltip',
    defaultMessage:
      'Filter ideas by project by clicking on the respective project. Multiple projects can be selected simultaneously.',
  },
  statusesTab: {
    id: 'app.components.admin.PostManager.statusesTab',
    defaultMessage: 'Status',
  },
  statusesTabTooltip: {
    id: 'app.components.admin.PostManager.statusesTabTooltip',
    defaultMessage:
      'Drag and drop selected ideas to the idea status you want to give them. By doing so, these ideas will no longer have their current status.',
  },
  basketsCountTooltip: {
    id: 'app.components.admin.PostManager.basketsCountTooltip',
    defaultMessage:
      'The number of users that added this idea to their participatory budget',
  },
  exportIdeas: {
    id: 'app.components.admin.PostManager.exportIdeas',
    defaultMessage: 'Export all ideas (.xslx)',
  },
  exportIdeasProjects: {
    id: 'app.components.admin.PostManager.exportIdeasProjects',
    defaultMessage: 'Export ideas for this project (.xslx)',
  },
  exportSelectedIdeas: {
    id: 'app.components.admin.PostManager.exportSelectedIdeas',
    defaultMessage: 'Export selected ideas (.xslx)',
  },
  exportIdeasComments: {
    id: 'app.components.admin.PostManager.exportIdeasComments',
    defaultMessage: 'Export all comments (.xslx)',
  },
  exportIdeasCommentsProjects: {
    id: 'app.components.admin.PostManager.exportIdeasCommentsProjects',
    defaultMessage: 'Export comments for this project (.xslx)',
  },
  exportSelectedIdeasComments: {
    id: 'app.components.admin.PostManager.exportSelectedIdeasComments',
    defaultMessage: 'Export comments for selected ideas (.xslx)',
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
  exportInitiativesComments: {
    id: 'app.components.admin.PostManager.exportInitiativesComments',
    defaultMessage: 'Export all comments (.xslx)',
  },
  exportSelectedInitiativesComments: {
    id: 'app.components.admin.PostManager.exportSelectedInitiativesComments',
    defaultMessage: 'Export comments for selected initiatives (.xslx)',
  },
  noOne: {
    id: 'app.components.admin.PostManager.noOne',
    defaultMessage: 'Unassigned',
  },
  exports: {
    id: 'app.components.admin.PostManager.exports',
    defaultMessage: 'Exports',
  },
  noIdeasHere: {
    id: 'app.components.admin.PostManager.noIdeasHere',
    defaultMessage: 'No ideas match the current filters',
  },
  noInitiativesHere: {
    id: 'app.components.admin.PostManager.noInitiativesHere',
    defaultMessage: 'No initiatives match the current filters',
  },
  resetFiltersDescription: {
    id: 'app.components.admin.PostManager.resetFiltersDescription',
    defaultMessage: 'Reset the filters to see all ideas.',
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
  allPhases: {
    id: 'app.components.admin.PostManager.allPhases',
    defaultMessage: 'All phases',
  },
  oneIdea: {
    id: 'app.components.admin.PostManager.oneIdea',
    defaultMessage: '1 idea',
  },
  multipleIdeas: {
    id: 'app.components.admin.PostManager.multipleIdeas',
    defaultMessage: '{ideaCount} ideas',
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
  ideas: {
    id: 'app.components.admin.PostManager.ideas',
    defaultMessage: 'ideas',
  },
  initiatives: {
    id: 'app.components.admin.PostManager.initiatives',
    defaultMessage: 'initiatives',
  },
});
