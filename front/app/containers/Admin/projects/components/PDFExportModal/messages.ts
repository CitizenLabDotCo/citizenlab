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
    id: 'app.containers.Admin.projects.all.clickExportToPDFIdeaForm2',
    defaultMessage:
      'All questions are shown on the PDF. However, the following are not currently supported for import via FormSync: Images, Tags and File Upload.',
  },
  clickExportToPDFSurvey: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey6',
    defaultMessage:
      'All questions are shown on the PDF. However, the following are not currently supported for import via FormSync: Mapping questions (drop pin, draw route and draw area), ranking questions, matrix questions and file upload questions.',
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
  collapsibleInstructionsStartTitle: {
    id: 'app.containers.Admin.projects.all.collapsibleInstructionsStartTitle',
    defaultMessage: 'Start of the form',
  },
  collapsibleInstructionsEndTitle: {
    id: 'app.containers.Admin.projects.all.collapsibleInstructionsEndTitle',
    defaultMessage: 'End of the form',
  },
  customiseStart: {
    id: 'app.containers.Admin.projects.all.customiseStart',
    defaultMessage: 'Customise the start of the form.',
  },
  customiseEnd: {
    id: 'app.containers.Admin.projects.all.customiseEnd',
    defaultMessage: 'Customise the end of the form.',
  },
});
