import { defineMessages } from 'react-intl';

export default defineMessages({
  schemaEdit: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaEdit',
    defaultMessage: 'Edit Schema',
  },
  schemaCopy: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaCopy',
    defaultMessage: 'Copy',
  },
  schemaCopyTooltip: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaCopyTooltip',
    defaultMessage:
      'The copied schema will have all IDs replaced with new UUIDs so it can be pasted into another form',
  },
  schemaCopied: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaCopied',
    defaultMessage: 'Copied!',
  },
  schemaSave: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaSave',
    defaultMessage: 'Save',
  },
  schemaCancelEdit: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaCancelEdit',
    defaultMessage: 'Cancel',
  },
  schemaParseError: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaParseError',
    defaultMessage: 'Invalid JSON',
  },
  schemaSaveDisabled: {
    id: 'app.components.FormBuilder.components.FormBuilderTopBar.superAdmin.schemaSaveDisabled',
    defaultMessage:
      'Cannot save schema on active platforms when there are survey responses',
  },
});
