import { defineMessages } from 'react-intl';

export default defineMessages({
  writtenIdeaImporter: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.writtenIdeaImporter',
    defaultMessage: 'Written idea importer',
  },
  uploadAPdfFile: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.uploadAPdfFile',
    defaultMessage:
      'Upload a <b>PDF file of scanned forms</b>. The PDF must use a form printed from this project available {hereLink}.',
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
