import { defineMessages } from 'react-intl';

export default defineMessages({
  writtenIdeaImporter: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.writtenIdeaImporter',
    defaultMessage: 'Written idea importer',
  },
  uploadAPdfExcelFile: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.uploadAPdfExcelFile',
    defaultMessage:
      'Upload a <b>PDF file of scanned forms</b> or a completed <b>Excel file</b>. The PDF must use a form printed from this project. ' +
      'The Excel file must use the template provided for this project. These can be downloaded {hereLink}.',
  },
  here: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.here',
    defaultMessage: 'here',
  },
  formLanguage: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.formLanguage',
    defaultMessage: 'Form language',
  },
});
