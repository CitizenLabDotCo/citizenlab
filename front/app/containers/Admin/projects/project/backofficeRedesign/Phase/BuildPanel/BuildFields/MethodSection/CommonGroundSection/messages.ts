import { defineMessages } from 'react-intl';

export default defineMessages({
  statementsSection: {
    id: 'app.containers.Admin.projects.project.statementsSection',
    defaultMessage: 'Statements',
  },
  importStatements: {
    id: 'app.containers.Admin.projects.project.importStatements',
    defaultMessage: 'Import',
  },
  importProjectLabel: {
    id: 'app.containers.Admin.projects.project.importProjectLabel',
    defaultMessage: 'Project',
  },
  importPhaseLabel: {
    id: 'app.containers.Admin.projects.project.importPhaseLabel',
    defaultMessage: 'Phase',
  },
  importingStatements: {
    id: 'app.containers.Admin.projects.project.importingStatements',
    defaultMessage: 'Importing {done}/{total}',
  },
  nStatements: {
    id: 'app.containers.Admin.projects.project.nStatements',
    defaultMessage: '{count, plural, one {# statement} other {# statements}}',
  },
});
