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
  importHint: {
    id: 'app.containers.admin.import.importHint',
    defaultMessage:
      'Important: In order to import the inputs correctly, no column can be removed from the import template. Leave unused columns empty.',
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
});
