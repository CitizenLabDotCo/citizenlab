import { defineMessages } from 'react-intl';

export default defineMessages({
  importExcelFileTitle: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.importExcelFileTitle',
    defaultMessage: 'Import Excel file',
  },
  importPDFFileTitle: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.importPDFFileTitle',
    defaultMessage: 'Import scanned forms',
  },
  uploadPdfFile: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.uploadPdfFile1',
    defaultMessage:
      'Upload a <b>PDF file of scanned forms</b>. It must use a form printed from this phase. {hereLink}',
  },
  formCanBeDownloadedHere: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.formCanBeDownloadedHere',
    defaultMessage: 'The form can be downloaded here.',
  },
  uploadExcelFile: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.uploadExcelFile',
    defaultMessage:
      'Upload a completed <b>Excel file</b> (.xlsx). It must use the template provided for this project. {hereLink}',
  },
  templateCanBeDownloadedHere: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.templateCanBeDownloadedHere',
    defaultMessage: 'The template can be downloaded here.',
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
  selectAPhase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.TopBar.selectAPhase',
    defaultMessage:
      'Please select to which phase you want to add these inputs.',
  },
  addToPhase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.addToPhase',
    defaultMessage: 'Add to phase',
  },
  upload: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.upload',
    defaultMessage: 'Upload',
  },
  googleConsent: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.googleConsent2',
    defaultMessage:
      'I hereby consent to processing this file using the Google Cloud Form Parser',
  },
  consentNeeded: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.consentNeeded',
    defaultMessage: 'You need to consent to this before you can continue',
  },
  pleaseUploadFile: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.pleaseUploadFile',
    defaultMessage: 'Please upload a file to continue',
  },
  formHasPersonalData: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ImportModal.formHasPersonalData',
    defaultMessage:
      'The uploaded form was created with the "Personal data" section',
  },
});
