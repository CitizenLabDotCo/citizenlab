import { defineMessages } from 'react-intl';

export default defineMessages({
  folder: {
    id: 'app.containers.AdminPage.ProjectEdit.folder',
    defaultMessage: 'Select a Folder',
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
