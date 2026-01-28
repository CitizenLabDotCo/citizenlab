import { defineMessages } from 'react-intl';

export default defineMessages({
  warning: {
    id: 'app.components.TypedConfirmationModal.warning',
    defaultMessage: 'This action is permanent and cannot be undone.',
  },
  typeToConfirm: {
    id: 'app.components.TypedConfirmationModal.typeToConfirm',
    defaultMessage: 'To confirm, type {confirmationWord} below:',
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
