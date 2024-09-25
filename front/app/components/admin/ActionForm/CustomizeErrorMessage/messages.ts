import { defineMessages } from 'react-intl';

export default defineMessages({
  errorMessage: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.errorMessage',
    defaultMessage: 'Error message',
  },
  customizeErrorMessage: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.customizeErrorMessage',
    defaultMessage: 'Customize error message',
  },
  errorMessageTooltip: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.errorMessageTooltip',
    defaultMessage:
      "This is what participants will see when they don't meet the participation requirements.",
  },
  saveErrorMessage: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.saveErrorMessage',
    defaultMessage: 'Save error message',
  },
  defaultErrorMessageExplanation: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.customErrorMessageExplanation',
    defaultMessage:
      'By default, the following error message will be shown to users:',
  },
  alternativeErrorMessage: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.alternativeErrorMessage',
    defaultMessage: 'Alternative error message',
  },
  customizeErrorMessageExplanation: {
    id: 'app.components.admin.ActionForm.CustomizeErrorMessage.customizeErrorMessageExplanation',
    defaultMessage:
      'You can overwrite this message for each language using the "Alternative error message" text box below. If you leave the text box empty, the default message will be shown.',
  },
});
