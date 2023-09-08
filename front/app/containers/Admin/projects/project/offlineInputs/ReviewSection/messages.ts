import { defineMessages } from 'react-intl';

export default defineMessages({
  importedIdeas: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.importedIdeas',
    defaultMessage: 'Imported ideas',
  },
  ideaImporter: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.ideaImporter',
    defaultMessage: 'Idea importer',
  },
  noIdeasYet: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.noIdeasYet3',
    defaultMessage:
      'Nothing to review yet. Click "{importFile}" to import a PDF file containing scanned input forms or an Excel file containing inputs.',
  },
  author: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.author',
    defaultMessage: 'Author:',
  },
  email: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.email',
    defaultMessage: 'Email:',
  },
  page: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.page',
    defaultMessage: 'Page',
  },
  phaseNotAllowed: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.phaseNotAllowed',
    defaultMessage:
      'The selected phase cannot contain ideas. Please select another one.',
  },
  formDataNotValid: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.formDataNotValid',
    defaultMessage: 'Invalid form data. Check the form above for errors.',
  },
  approve: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.approve',
    defaultMessage: 'Approve',
  },
  phase: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.phase',
    defaultMessage: 'Phase:',
  },
  pdfNotAvailable: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.pdfNotAvailable',
    defaultMessage:
      'Cannot display the imported file. Imported file viewing is only available for PDF imports.',
  },
  locale: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.locale',
    defaultMessage: 'Locale:',
  },
});
