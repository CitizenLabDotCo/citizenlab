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
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey',
    defaultMessage:
      'Questions not currently supported: Location and File Upload.',
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
  personalDataExplanation: {
    id: 'app.containers.Admin.projects.all.personalDataExplanation1',
    defaultMessage:
      'If you check the box below, we will create user accounts for offline participants.',
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
