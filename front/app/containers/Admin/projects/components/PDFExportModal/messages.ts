import { defineMessages } from 'react-intl';

export default defineMessages({
  exportAsPDF: {
    id: 'app.containers.Admin.projects.all.exportAsPDF',
    defaultMessage: 'Export as pdf',
  },
  includeFullName: {
    id: 'app.containers.Admin.projects.all.includeFullName',
    defaultMessage: 'Include full name',
  },
  includeEmail: {
    id: 'app.containers.Admin.projects.all.includeEmail',
    defaultMessage: 'Include email',
  },
  clickExportToPDFIdeaForm: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFIdeaForm2',
    defaultMessage:
      "Click 'Export as pdf' below to download a pdf version of the input form. Be aware that at the moment the Images, File Upload, Tags and Linear Scale fields are not supported for the pdf version.",
  },
  clickExportToPDFSurvey: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey2',
    defaultMessage:
      "Click 'Export as pdf' below to download a pdf version of the survey. Be aware that at the moment the Linear Scale and File Upload fields are not supported for the pdf version.",
  },
  itIsAlsoPossible: {
    id: 'app.containers.Admin.projects.all.itIsAlsoPossible',
    defaultMessage:
      "It is also possible to upload the filled-out input forms back to the platform. Our Offline Input Importer will automatically detect the handwriting on the forms. This makes combining online and offline participation a lot easier. To open the Offline Input Importer, go to the 'Input manager' tab of this project, and click 'Add offline inputs'.",
  },
  nameAndEmailExplanation: {
    id: 'app.containers.Admin.projects.all.nameAndEmailExplanation',
    defaultMessage:
      "To add a 'Full name' and/or 'Email' field to the pdf form, tick the desired boxes below. The Offline Input Importer will automatically create an account using the provided information. If you don't add these fields, or if they are left blank by the respondent, the input will be treated as anonymous.",
  },
  phase: {
    id: 'app.containers.Admin.projects.all.PDFExportModal.phase',
    defaultMessage: 'Phase',
  },
  selectIdeationPhase: {
    id: 'app.containers.Admin.projects.all.PDFExportModal.selectIdeationPhase',
    defaultMessage: 'Please select an ideation phase.',
  },
});
