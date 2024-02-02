import { defineMessages } from 'react-intl';

export default defineMessages({
  duplicate: {
    id: 'app.components.formBuilder.formField.duplicate',
    defaultMessage: 'Duplicate',
  },
  delete: {
    id: 'app.components.formBuilder.formField.delete',
    defaultMessage: 'Delete',
  },
  copy: {
    id: 'app.components.formBuilder.formField.copy',
    defaultMessage: 'Copy',
  },
  deleteFieldWithLogicConfirmationQuestion: {
    id: 'app.components.formBuilder.formField.deleteFieldWithLogicConfirmationQuestion',
    defaultMessage:
      'Deleting this page will also delete the logic associated with it. Are you sure you want to delete it?',
  },
  confirmDeleteFieldWithLogicButtonText: {
    id: 'app.components.formBuilder.formField.confirmDeleteFieldWithLogicButtonText',
    defaultMessage: 'Yes, delete page',
  },
  deleteResultsInfo: {
    id: 'app.components.formBuilder.formField.deleteResultsInfo',
    defaultMessage: 'This cannot be undone',
  },
  cancelDeleteButtonText: {
    id: 'app.components.formBuilder.formField.cancelDeleteButtonText',
    defaultMessage: 'Cancel',
  },
});
