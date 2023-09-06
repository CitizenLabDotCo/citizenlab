import { defineMessages } from 'react-intl';

export default defineMessages({
  importInputs: {
    id: 'app.containers.admin.import.importInputs',
    defaultMessage: 'Import inputs',
  },
  importDescription: {
    id: 'app.containers.admin.import.importDescription',
    defaultMessage: 'Import existing inputs from an Excel file.',
  },
  importStepOne: {
    id: 'app.containers.admin.import.importStepOne',
    defaultMessage: '1. Download and fill out the template',
  },
  downloadTemplate: {
    id: 'app.containers.admin.import.downloadTemplate',
    defaultMessage: 'Download template',
  },
  importStepTwo: {
    id: 'app.containers.admin.import.importStepTwo',
    defaultMessage: '2. Upload your completed template file',
  },
  importInput: {
    id: 'app.containers.admin.import.importInput',
    defaultMessage: 'Import input',
  },
  successMessage: {
    id: 'app.containers.admin.import.successMessage',
    defaultMessage: 'File imported successfully!',
  },
  ideasBeingImported: {
    id: 'app.containers.admin.import.ideasBeingImported2',
    defaultMessage:
      'Your ideas are being imported. This can take a while. Please do not close this page.',
  },
  importTakingLonger: {
    id: 'app.containers.admin.import.ideasBeingImported',
    defaultMessage:
      'Import taking longer than one minute. Try waiting another minute. If you then still see this message, try going back to the input manager, wait another minute, and refresh the page. If that does not work, try importing again.',
  },
  somethingWentWrong: {
    id: 'app.containers.admin.import.somethingWentWrong2',
    defaultMessage:
      'Something went wrong. This could be an issue with your excel file. If you are completely sure that there are no problems with your excel file: try going back to the input manager, wait a few minutes, and refresh the page. If that does not work, try importing again.',
  },
});
