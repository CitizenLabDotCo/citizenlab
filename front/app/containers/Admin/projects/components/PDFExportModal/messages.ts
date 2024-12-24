import { defineMessages } from 'react-intl';

export default defineMessages({
  exportAsPDF: {
    id: 'app.containers.Admin.projects.all.exportAsPDF1',
    defaultMessage: 'Download PDF form',
  },
  notes: {
    id: 'app.containers.Admin.projects.all.notes',
    defaultMessage: 'Notes',
  },
  askPersonalData: {
    id: 'app.containers.Admin.projects.all.askPersonalData',
    defaultMessage: 'Ask personal data',
  },
  clickExportToPDFIdeaForm: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFIdeaForm',
    defaultMessage:
      'Questions not currently supported: Images, Tags and File Upload.',
  },
  clickExportToPDFSurvey: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey3',
    defaultMessage:
      'Questions not currently supported: Mapping questions (drop pin, draw route and draw area), image choice questions and file upload questions.',
  },
  itIsAlsoPossibleIdeation: {
    id: 'app.containers.Admin.projects.all.itIsAlsoPossible1',
    defaultMessage:
      "You can combine online and offline responses. To upload offline responses, go to the 'Input manager' tab of this project, and click 'Import'.",
  },
  itIsAlsoPossibleSurvey: {
    id: 'app.containers.Admin.projects.all.itIsAlsoPossibleSurvey1',
    defaultMessage:
      "You can combine online and offline responses. To upload offline responses, go to the 'Survey' tab of this project, and click 'Import'.",
  },
  notIncludedInYourPlan: {
    id: 'app.containers.Admin.projects.all.notIncludedInYourPlan',
    defaultMessage:
      'However, this is not included in your current plan. Reach out to your Government Success Manager or admin to unlock it.',
  },
  logicNotInPDF: {
    id: 'app.containers.Admin.projects.all.logicNotInPDF',
    defaultMessage:
      'Survey logic will not be reflected in the downloaded PDF. Paper respondents will see all survey questions.',
  },
  personalDataExplanation: {
    id: 'app.containers.Admin.projects.all.personalDataExplanation2',
    defaultMessage:
      'Check the box below, if you want your downloaded PDF to contain name, last name, and email fields. Upon upload of the paper form, we will use that user data, to auto-generate an account for the offline survey respondent.',
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
