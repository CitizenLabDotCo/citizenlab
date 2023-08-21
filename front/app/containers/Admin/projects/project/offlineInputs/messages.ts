import { defineMessages } from 'react-intl';

export default defineMessages({
  importPdf: {
    id: 'app.containers.Admin.projects.project.offlineInputs.importPdf',
    defaultMessage: 'Import PDF',
  },
  importedIdeas: {
    id: 'app.containers.Admin.projects.project.offlineInputs.importedIdeas',
    defaultMessage: 'Imported ideas',
  },
  ideaImporter: {
    id: 'app.containers.Admin.projects.project.offlineInputs.ideaImporter',
    defaultMessage: 'Idea importer',
  },
  noIdeasYet: {
    id: 'app.containers.Admin.projects.project.offlineInputs.noIdeasYet',
    defaultMessage:
      'There are no ideas to review yet. Click "{importPdf}" to import a PDF file containing scanned idea forms.',
  },
});
