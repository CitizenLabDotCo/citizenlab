import { defineMessages } from 'react-intl';

export default defineMessages({
  addTags: {
    id: 'app.components.UI.TagPicker.addTags',
    defaultMessage: 'Add tags',
  },
  searchTags: {
    id: 'app.components.UI.TagPicker.searchTags',
    defaultMessage: 'Search tags',
  },
  noMatch: {
    id: 'app.components.UI.TagPicker.noMatch',
    defaultMessage: 'No tags match your search.',
  },
  selectedCount: {
    id: 'app.components.UI.TagPicker.selectedCount',
    defaultMessage:
      '{count, plural, =0 {No tags selected} one {# tag selected} other {# tags selected}}',
  },
  done: {
    id: 'app.components.UI.TagPicker.done',
    defaultMessage: 'Done',
  },
  removeTag: {
    id: 'app.components.UI.TagPicker.removeTag',
    defaultMessage: 'Remove {tag}',
  },
});
