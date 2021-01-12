import { defineMessages } from 'react-intl';

export default defineMessages({
  projectFolder: {
    id: 'app.containers.AdminPage.ProjectEdit.projectFolder',
    defaultMessage: 'Project folder {optional}',
  },
  optional: {
    id: 'app.containers.AdminPage.ProjectEdit.optional',
    defaultMessage: '(optional)',
  },
  folderTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.folderTooltip',
    defaultMessage:
      'Select one of the options to automatically place this project inside a folder.',
  },
  noFolder: {
    id: 'app.containers.AdminPage.ProjectEdit.noFolder',
    defaultMessage: 'No Folder (at the top level).',
  },
});
