import { defineMessages } from 'react-intl';

export default defineMessages({
  a11y_folderTitle: {
    id: 'app.components.FolderFolderCard.a11y_folderTitle',
    defaultMessage: 'Folder title: ',
  },
  a11y_folderDescription: {
    id: 'app.components.FolderFolderCard.a11y_folderDescription',
    defaultMessage: 'Folder description: ',
  },
  numberOfProjectsInFolder: {
    id: 'app.components.FolderFolderCard.numberOfProjectsInFolder',
    defaultMessage:
      '{numberOfProjectsInFolder, plural, no {# projects} one {# project} other {# projects}}',
  },
  archived: {
    id: 'app.components.FolderFolderCard.archived',
    defaultMessage: 'Archived',
  },
});
