import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.components.admin.IdeaManager.header',
    defaultMessage: 'Ideas',
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
  title: {
    id: 'app.components.admin.IdeaManager.title',
    defaultMessage: 'Title',
  },
  author: {
    id: 'app.components.admin.IdeaManager.author',
    defaultMessage: 'Author',
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
  topicsTab: {
    id: 'app.components.admin.IdeaManager.topicsTab',
    defaultMessage: 'Topics',
  },
  projectsTab: {
    id: 'app.components.admin.IdeaManager.projectsTab',
    defaultMessage: 'Projects',
  },
  statusesTab: {
    id: 'app.components.admin.IdeaManager.statusesTab',
    defaultMessage: 'Status',
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
  titleIdeas: {
    id: 'app.components.admin.IdeaManager.titleIdeas',
    defaultMessage: 'Manage idea',
  },
  subtitleIdeas: {
    id: 'app.components.admin.IdeaManager.subtitleIdeas',
    defaultMessage: 'Get an overview of all the ideas inside your project. Add themes, change the status by dragging and dropping them to one of the left columns or edit the ideas (add image, take out typo’s).',
  },
});
