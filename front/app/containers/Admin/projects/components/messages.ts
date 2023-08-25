import { defineMessages } from 'react-intl';

export default defineMessages({
  archived: {
    id: 'app.containers.Admin.projects.all.components.archived',
    defaultMessage: 'Archived',
  },
  draft: {
    id: 'app.containers.Admin.projects.all.components.draft',
    defaultMessage: 'Draft',
  },
  deleteProjectConfirmation: {
    id: 'app.containers.Admin.projects.all.deleteProjectConfirmation',
    defaultMessage:
      'Are you sure you want to delete this project? This cannot be undone.',
  },
  deleteProjectError: {
    id: 'app.containers.Admin.projects.all.deleteProjectError',
    defaultMessage:
      'There was an error deleting this project, please try again later.',
  },
  copyProjectError: {
    id: 'app.containers.Admin.projects.all.copyProjectError',
    defaultMessage:
      'There was an error copying this project, please try again later.',
  },
  deleteProjectButtonFull: {
    id: 'app.containers.Admin.projects.all.deleteProjectButtonFull',
    defaultMessage: 'Delete project',
  },
  copyProjectButton: {
    id: 'app.containers.Admin.projects.all.copyProjectButton',
    defaultMessage: 'Copy project',
  },
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
    id: 'app.containers.Admin.projects.all.clickExportToPDFIdeaForm',
    defaultMessage:
      "Click 'Export as pdf' below to download a pdf version of the input form. Be aware that at the moment the Images, File Upload, Tags, Linear Scale and Number fields are not supported for the pdf version.",
  },
  clickExportToPDFSurvey: {
    id: 'app.containers.Admin.projects.all.clickExportToPDFSurvey',
    defaultMessage:
      "Click 'Export as pdf' below to download a pdf version of the survey. Be aware that at the moment the Linear Scale, Number and File Upload fields are not supported for the pdf version.",
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
});
