import { defineMessages } from 'react-intl';

export default defineMessages({
  tagCount: {
    id: 'app.containers.Admin.projects.project.backofficeRedesign.InputTags.tagCount',
    defaultMessage: '{count, plural, one {# tag} other {# tags}}',
  },
  searchTags: {
    id: 'app.containers.Admin.projects.project.searchInputTags',
    defaultMessage: 'Search tags',
  },
  addTagPlaceholder: {
    id: 'app.containers.Admin.projects.project.addInputTagPlaceholder',
    defaultMessage: 'Add a tag',
  },
  tagsRequiredInfo: {
    id: 'app.containers.Admin.projects.project.tagsRequiredInfo',
    defaultMessage:
      "At least one tag is required. To skip tags, remove the 'Tags' item from any phase's form.",
  },
  selectAllTags: {
    id: 'app.containers.Admin.projects.project.selectAllTags',
    defaultMessage: 'Select all tags',
  },
  selectTag: {
    id: 'app.containers.Admin.projects.project.selectTag',
    defaultMessage: 'Select {tagName}',
  },
  selectedCount: {
    id: 'app.containers.Admin.projects.project.selectedTagCount',
    defaultMessage: '{count} selected',
  },
  deletedCount: {
    id: 'app.containers.Admin.projects.project.deletedTagCount',
    defaultMessage:
      '{count, plural, one {# tag deleted} other {# tags deleted}}',
  },
  undo: {
    id: 'app.containers.Admin.projects.project.undoTagDelete',
    defaultMessage: 'Undo',
  },
  settingsCreateAndManageTags: {
    id: 'app.containers.Admin.projects.project.settingsCreateAndManageTags',
    defaultMessage: 'Create and manage',
  },
  settingsAddTag: {
    id: 'app.containers.Admin.projects.project.settingsAddTag',
    defaultMessage: 'Add tag',
  },
});
