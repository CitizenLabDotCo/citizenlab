import { defineMessages } from 'react-intl';

export default defineMessages({
  exportAsPDF: {
    id: 'app.containers.Admin.projects.all.exportAsPDF',
    defaultMessage: 'Export as pdf',
  },
  askPersonalData: {
    id: 'app.containers.Admin.projects.all.askPersonalData',
    defaultMessage: 'Ask personal data',
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
  itIsAlsoPossibleIdeation: {
    id: 'app.containers.Admin.projects.all.itIsAlsoPossible',
    defaultMessage:
      "It is also possible to upload the filled-out input forms back to the platform. Our Offline Input Importer will automatically detect the handwriting on the forms. This makes combining online and offline participation a lot easier. To open the Offline Input Importer, go to the 'Input manager' tab of this project, and click 'Add offline inputs'.",
  },
  itIsAlsoPossibleSurvey: {
    id: 'app.containers.Admin.projects.all.itIsAlsoPossibleSurvey',
    defaultMessage:
      "It is also possible to upload the filled-out surveys back to the platform. Our Offline Input Importer will automatically detect the handwriting on the forms. This makes combining online and offline participation a lot easier. To open the Offline Input Importer, go to the 'Survey' tab of this project, and click 'Add offline inputs'.",
  },
  personalDataExplanation: {
    id: 'app.containers.Admin.projects.all.personalDataExplanation',
    defaultMessage:
      "To ask people for their name, email, and consent to automatically create an account for them, tick the checkbox below. If you don't check this box, or if the user does not consent to having an account created, the input will be treated as anonymous.",
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
