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
  editSchema: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.editSchema',
    defaultMessage: 'Edit schema',
  },
  editSchemaTitle: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.editSchemaTitle',
    defaultMessage: 'Edit Form Schema',
  },
  copySchema: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.copySchema',
    defaultMessage: 'Copy',
  },
  copySchemaTooltip: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.copySchemaTooltip',
    defaultMessage:
      'The copied schema will have all IDs removed so it can be pasted into another form',
  },
  schemaCopied: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaCopied',
    defaultMessage: 'Copied!',
  },
  saveSchema: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.saveSchema',
    defaultMessage: 'Save',
  },
  cancelEditSchema: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.cancelEditSchema',
    defaultMessage: 'Cancel',
  },
  schemaParseError: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.schemaParseError',
    defaultMessage: 'Invalid JSON',
  },
});
