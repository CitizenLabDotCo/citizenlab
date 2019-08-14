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
  unassignedIdeas: {
    id: 'app.components.admin.PostManager.unassignedIdeas',
    defaultMessage: 'Unassigned',
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
    defaultMessage: 'Moving \'{ideaTitle}\' away from its current project will lose the information about its assigned phases. Do you want to proceed?',
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
  author: {
    id: 'app.components.admin.PostManager.author',
    defaultMessage: 'Author',
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
  multiDragAndDropHelp: {
    id: 'app.components.admin.PostManager.multiDragAndDropHelp',
    defaultMessage: 'Drag and drop the ideas on an item above to assign them all at once.',
  },
  timelineTab: {
    id: 'app.components.admin.PostManager.timelineTab',
    defaultMessage: 'Timeline',
  },
  timelineTabTooltip: {
    id: 'app.components.admin.PostManager.timelineTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the phase you want to add them to. By doing so, they will also remain in the current phase(s).',
  },
  topicsTab: {
    id: 'app.components.admin.PostManager.topicsTab',
    defaultMessage: 'Topics',
  },
  topicsTabTooltip: {
    id: 'app.components.admin.PostManager.topicsTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the topic you want to assign them to. An idea can have any number of topics.',
  },
  projectsTab: {
    id: 'app.components.admin.PostManager.projectsTab',
    defaultMessage: 'Projects',
  },
  projectsTabTooltip: {
    id: 'app.components.admin.PostManager.projectsTabTooltip',
    defaultMessage: 'Filter ideas by project by clicking on the respective project. Multiple projects can be selected simultaneously.',
  },
  columnsTooltip: {
    id: 'app.components.admin.PostManager.columnsTooltip',
    defaultMessage: 'Order the ideas by any of the variables by clicking the respective column header.',
  },
  statusesTab: {
    id: 'app.components.admin.PostManager.statusesTab',
    defaultMessage: 'Status',
  },
  statusesTabTooltip: {
    id: 'app.components.admin.PostManager.statusesTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the idea status you want to give them. By doing so, these ideas will no longer have their current status.',
  },
  allIdeas: {
    id: 'app.components.admin.PostManager.allIdeas',
    defaultMessage: 'All ideas',
  },
  basketsCountTooltip: {
    id: 'app.components.admin.PostManager.basketsCountTooltip',
    defaultMessage: 'The number of users that added this idea to their participatory budget',
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
});
