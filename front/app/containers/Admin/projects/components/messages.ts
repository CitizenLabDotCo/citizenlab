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
});
