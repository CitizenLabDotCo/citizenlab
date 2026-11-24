import { defineMessages } from 'react-intl';

export default defineMessages({
  warning: {
    id: 'app.components.TypedConfirmationModal.warning',
    defaultMessage: 'This action is permanent and cannot be undone.',
  },
  typeToConfirm: {
    id: 'app.components.TypedConfirmationModal.typeToConfirm1',
    defaultMessage:
      'To confirm the deletion of {entityName}, type {confirmationWord} below:',
  },
  typeToConfirmShort: {
    id: 'app.components.TypedConfirmationModal.typeToConfirmShort',
    defaultMessage: 'Type {confirmationWord} to confirm',
  },
  cancel: {
    id: 'app.components.TypedConfirmationModal.cancel',
    defaultMessage: 'Cancel',
  },
  confirmationWordDelete: {
    id: 'app.components.TypedConfirmationModal.confirmationWordDelete',
    defaultMessage: 'DELETE',
  },
});
