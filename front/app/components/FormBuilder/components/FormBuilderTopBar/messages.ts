import { defineMessages } from 'react-intl';

export default defineMessages({
  autosave: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.autosave',
    defaultMessage: 'Autosave',
  },
  autosaveTooltip: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.autosaveTooltip4',
    defaultMessage:
      'Auto-saving is enabled by default when you open the form editor. Any time you close the field settings panel using the "X" button, it will automatically trigger a save.',
  },
  schemaEdit: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaEdit',
    defaultMessage: 'Edit Schema',
  },
  schemaCopy: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaCopy',
    defaultMessage: 'Copy',
  },
  schemaCopyTooltip: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaCopyTooltip',
    defaultMessage:
      'The copied schema will have all IDs replaced with new UUIDs so it can be pasted into another form',
  },
  schemaCopied: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaCopied',
    defaultMessage: 'Copied!',
  },
  schemaSave: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaSave',
    defaultMessage: 'Save',
  },
  schemaCancelEdit: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaCancelEdit',
    defaultMessage: 'Cancel',
  },
  schemaParseError: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaParseError',
    defaultMessage: 'Invalid JSON',
  },
  schemaSaveDisabled: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaSaveDisabled',
    defaultMessage:
      'Cannot save schema on active platforms when there are survey responses',
  },
});
