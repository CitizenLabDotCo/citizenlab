import { defineMessages } from 'react-intl';

export default defineMessages({
  importedInputs: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.importedInputs',
    defaultMessage: 'Imported inputs',
  },
  noTitleInputLabel: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.noTitleInputLabel',
    defaultMessage: 'Input',
  },
  noIdeasYet: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.noIdeasYet3',
    defaultMessage:
      'Nothing to review yet. Click "{importFile}" to import a PDF file containing scanned input forms or an Excel file containing inputs.',
  },
  noIdeasYetNoPdf: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.noIdeasYetNoPdf',
    defaultMessage:
      'Nothing to review yet. Click "{importFile}" to import an Excel file containing inputs.',
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
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.phaseNotAllowed2',
    defaultMessage:
      'The selected phase cannot contain inputs. Please select another one.',
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
  inputImportedAnonymously: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.inputImportedAnonymously',
    defaultMessage: 'This input was imported anonymously.',
  },
  inputsImported: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.inputsImported',
    defaultMessage:
      '{numIdeas} inputs have been imported and require approval.',
  },
  importing: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.importing2',
    defaultMessage: 'Importing. This process may take a few minutes.',
  },
  errorImporting: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.errorImportingLabel',
    defaultMessage:
      'Errors occurred during the import and some inputs have not imported. Please correct the errors and re-import any missing inputs.',
  },
  inputsNotApproved: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.inputsNotApproved2',
    defaultMessage:
      '{numNotApproved} inputs could not be approved. Please check each input for validation issues and confirm individually.',
  },
  approveAllInputs: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ReviewSection.approveAllInputs',
    defaultMessage: 'Approve all inputs',
  },
});
