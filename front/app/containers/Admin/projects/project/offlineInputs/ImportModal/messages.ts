import { defineMessages } from 'react-intl';

export default defineMessages({
  ideaImporter: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.ideaImporter',
    defaultMessage: 'Idea importer',
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
  noPhasesInProject: {
    id: 'app.containers.Admin.projects.project.offlineInputs.TopBar.noPhasesInProject',
    defaultMessage:
      'This project does not contain any phases that can contain ideas.',
  },
  selectAnotherPhase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.TopBar.selectAnotherPhase2',
    defaultMessage: 'Please select an ideation or voting phase.',
  },
  addToPhase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.addToPhase',
    defaultMessage: 'Add to phase',
  },
  upload: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.upload',
    defaultMessage: 'Upload',
  },
});
