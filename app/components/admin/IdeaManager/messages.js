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
  deleteAll: {
    id: 'app.components.admin.IdeaManager.deleteAll',
    defaultMessage: 'Delete all',
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
});
