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
  askPersonalData3: {
    id: 'app.containers.Admin.projects.all.askPersonalData3',
    defaultMessage: 'Add fields for name and email',
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
  personalDataExplanation5: {
    id: 'app.containers.Admin.projects.all.personalDataExplanation5',
    defaultMessage:
      'This option will add the first name, last name, and email fields to the exported PDF. Upon uploading the paper form, we will use that data to auto-generate an account for the offline survey respondent.',
  },
  instructionsStart: {
    id: 'app.containers.Admin.projects.all.instructionsStart',
    defaultMessage: 'Instructions at the start',
  },
  instructionsStartBodyError: {
    id: 'app.containers.Admin.projects.all.instructionsStartBodyError',
    defaultMessage: 'Instructions at the start is required for every locale',
  },
});
