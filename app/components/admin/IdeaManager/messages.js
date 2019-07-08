import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.components.admin.IdeaManager.header',
    defaultMessage: 'Ideas',
  },
  anyFeedbackStatus: {
    id: 'app.components.admin.IdeaManager.anyFeedbackStatus',
    defaultMessage: 'All ideas',
  },
  needFeedback: {
    id: 'app.components.admin.IdeaManager.needFeedback',
    defaultMessage: 'Need Feedback',
  },
  anyAssignment: {
    id: 'app.components.admin.IdeaManager.anyAssignment',
    defaultMessage: 'All ideas',
  },
  unassignedIdeas: {
    id: 'app.components.admin.IdeaManager.unassignedIdeas',
    defaultMessage: 'Unassigned',
  },
  assignedToMe: {
    id: 'app.components.admin.IdeaManager.assignedToMe',
    defaultMessage: 'Assigned to me',
  },
  delete: {
    id: 'app.components.admin.IdeaManager.delete',
    defaultMessage: 'Delete',
  },
  deleteAllSelectedIdeas: {
    id: 'app.components.admin.IdeaManager.deleteAllSelectedIdeas',
    defaultMessage: 'Delete {count} selected ideas',
  },
  deleteIdeaConfirmation: {
    id: 'app.components.admin.IdeaManager.deleteIdeaConfirmation',
    defaultMessage: 'Are you sure you want to delete this idea?',
  },
  deleteIdeasConfirmation: {
    id: 'app.components.admin.IdeaManager.deleteIdeasConfirmation',
    defaultMessage: 'Are you sure you want to delete {count} ideas?',
  },
  losePhaseInfoConfirmation: {
    id: 'app.components.admin.IdeaManager.losePhaseInfoConfirmation',
    defaultMessage: 'Moving \'{ideaTitle}\' away from its current project will lose the information about its assigned phases. Do you want to proceed?',
  },
  edit: {
    id: 'app.components.admin.IdeaManager.edit',
    defaultMessage: 'Edit',
  },
  assignedTo: {
    id: 'app.components.admin.IdeaManager.assignedTo',
    defaultMessage: 'Assigned to {assigneeName}',
  },
  title: {
    id: 'app.components.admin.IdeaManager.title',
    defaultMessage: 'Title',
  },
  author: {
    id: 'app.components.admin.IdeaManager.author',
    defaultMessage: 'Author',
  },
  assignee: {
    id: 'app.components.admin.IdeaManager.assignee',
    defaultMessage: 'Assignee',
  },
  publication_date: {
    id: 'app.components.admin.IdeaManager.publication_date',
    defaultMessage: 'Published on',
  },
  up: {
    id: 'app.components.admin.IdeaManager.up',
    defaultMessage: 'Up',
  },
  down: {
    id: 'app.components.admin.IdeaManager.down',
    defaultMessage: 'Down',
  },
  participatoryBudgettingPicks: {
    id: 'app.components.admin.IdeaManager.participatoryBudgettingPicks',
    defaultMessage: 'Picks',
  },
  multiDragAndDropHelp: {
    id: 'app.components.admin.IdeaManager.multiDragAndDropHelp',
    defaultMessage: 'Drag and drop the ideas on an item above to assign them all at once.',
  },
  timelineTab: {
    id: 'app.components.admin.IdeaManager.timelineTab',
    defaultMessage: 'Timeline',
  },
  timelineTabTooltip: {
    id: 'app.components.admin.IdeaManager.timelineTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the phase you want to add them to. By doing so, they will also remain in the current phase(s).',
  },
  topicsTab: {
    id: 'app.components.admin.IdeaManager.topicsTab',
    defaultMessage: 'Topics',
  },
  topicsTabTooltip: {
    id: 'app.components.admin.IdeaManager.topicsTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the topic you want to assign them to. An idea can have any number of topics.',
  },
  projectsTab: {
    id: 'app.components.admin.IdeaManager.projectsTab',
    defaultMessage: 'Projects',
  },
  projectsTabTooltip: {
    id: 'app.components.admin.IdeaManager.projectsTabTooltip',
    defaultMessage: 'Filter ideas by project by clicking on the respective project. Multiple projects can be selected simultaneously.',
  },
  columnsTooltip: {
    id: 'app.components.admin.IdeaManager.columnsTooltip',
    defaultMessage: 'Order the ideas by any of the variables by clicking the respective column header.',
  },
  statusesTab: {
    id: 'app.components.admin.IdeaManager.statusesTab',
    defaultMessage: 'Status',
  },
  statusesTabTooltip: {
    id: 'app.components.admin.IdeaManager.statusesTabTooltip',
    defaultMessage: 'Drag and drop selected ideas to the idea status you want to give them. By doing so, these ideas will no longer have their current status.',
  },
  allIdeas: {
    id: 'app.components.admin.IdeaManager.allIdeas',
    defaultMessage: 'All ideas',
  },
  basketsCountTooltip: {
    id: 'app.components.admin.IdeaManager.basketsCountTooltip',
    defaultMessage: 'The number of users that added this idea to their participatory budget',
  },
  exportIdeas: {
    id: 'app.components.admin.IdeaManager.exportIdeas',
    defaultMessage: 'Export all ideas (.xslx)',
  },
  exportIdeasProjects: {
    id: 'app.components.admin.IdeaManager.exportIdeasProjects',
    defaultMessage: 'Export ideas for this project (.xslx)',
  },
  exportSelectedIdeas: {
    id: 'app.components.admin.IdeaManager.exportSelectedIdeas',
    defaultMessage: 'Export selected ideas (.xslx)',
  },
  exportComments: {
    id: 'app.components.admin.IdeaManager.exportComments',
    defaultMessage: 'Export all comments (.xslx)',
  },
  exportCommentsProjects: {
    id: 'app.components.admin.IdeaManager.exportCommentsProjects',
    defaultMessage: 'Export comments for this project (.xslx)',
  },
  exportSelectedComments: {
    id: 'app.components.admin.IdeaManager.exportSelectedComments',
    defaultMessage: 'Export comments for selected ideas (.xslx)',
  },
  noOne: {
    id: 'app.components.admin.IdeaManager.noOne',
    defaultMessage: 'Unassigned',
  },
  exports: {
    id: 'app.components.admin.IdeaManager.exports',
    defaultMessage: 'Exports',
  },
  noIdeasHere: {
    id: 'app.components.admin.IdeaManager.noIdeasHere',
    defaultMessage: 'No ideas match the current filters',
  },
  resetFiltersDescription: {
    id: 'app.components.admin.IdeaManager.resetFiltersDescription',
    defaultMessage: 'Reset the filters to see all ideas.',
  },
  resetFiltersButton: {
    id: 'app.components.admin.IdeaManager.resetFiltersButton',
    defaultMessage: 'Reset filters',
  },
  allProjects: {
    id: 'app.components.admin.IdeaManager.allProjects',
    defaultMessage: 'All projects',
  },
  allTopics: {
    id: 'app.components.admin.IdeaManager.allTopics',
    defaultMessage: 'All topics',
  },
  allStatuses: {
    id: 'app.components.admin.IdeaManager.allStatuses',
    defaultMessage: 'All statuses',
  },
  allPhases: {
    id: 'app.components.admin.IdeaManager.allPhases',
    defaultMessage: 'All phases',
  },
  oneIdea: {
    id: 'app.components.admin.IdeaManager.oneIdea',
    defaultMessage: '1 idea',
  },
  multipleIdeas: {
    id: 'app.components.admin.IdeaManager.multipleIdeas',
    defaultMessage: '{ideaCount} ideas',
  },
});
