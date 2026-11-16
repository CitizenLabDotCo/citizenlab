import { defineMessages } from 'react-intl';

export default defineMessages({
  tagsRequiredInfo: {
    id: 'app.containers.Admin.projects.project.tagsRequiredInfo',
    defaultMessage:
      "At least one tag is required. To skip tags, remove the 'Tags' item from any phase's form.",
  },
  reorderTag: {
    id: 'app.containers.Admin.projects.project.reorderTag',
    defaultMessage: 'Drag to reorder {tagName}',
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
