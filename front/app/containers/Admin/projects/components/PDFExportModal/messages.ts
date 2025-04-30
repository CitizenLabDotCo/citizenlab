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
  askPersonalData1: {
    id: 'app.containers.Admin.projects.all.askPersonalData1',
    defaultMessage:
      'Add fields for name and email to create accounts for offline participants.',
  },
  clickExportToPDFIdeaForm: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFIdeaForm',
    defaultMessage:
      'Questions not currently supported: Images, Tags and File Upload.',
  },
  clickExportToPDFSurvey: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey5',
    defaultMessage:
      'Questions not currently supported: Mapping questions (drop pin, draw route and draw area), image choice questions, ranking questions, matrix questions and file upload questions.',
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
  logicNotInPDF: {
    id: 'app.containers.Admin.projects.all.logicNotInPDF',
    defaultMessage:
      'Survey logic will not be reflected in the downloaded PDF. Paper respondents will see all survey questions.',
  },
  personalDataExplanation: {
    id: 'app.containers.Admin.projects.all.personalDataExplanation',
    defaultMessage:
      'This option will add the name, last name, and email fields to the exported PDF. Upon uploading the paper form, we will use that data to auto-generate an account for the offline survey respondent. Alternatively, you can use it to manually create an account for the offline survey respondent.',
  },
});
