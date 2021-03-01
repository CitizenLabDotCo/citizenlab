import { defineMessages } from 'react-intl';

export default defineMessages({
  folderManagerTooltip: {
    id: 'app.containers.AdminPage.FolderPermissions.folderManagerTooltip',
    defaultMessage:
      'Folder managers can edit the folder description, create new projects within the folder, and have project management rights over all projects within the folder. They cannot delete projects and they do not have access to projects that are not within their folder. You can {projectManagementInfoCenterLink} to find more information on project management rights.',
  },
  moreInfoFolderManagerLink: {
    id: 'app.containers.AdminPage.FolderPermissions.moreInfoFolderManagerLink',
    defaultMessage:
      'https://support.citizenlab.co/en/articles/4648650-assign-the-right-project-managers',
  },
  projectManagementInfoCenterLinkText: {
    id:
      'app.containers.AdminPage.FolderPermissions.projectManagementInfoCenterLinkText',
    defaultMessage: 'visit our Help Center',
  },
  folderManagerSectionTitle: {
    id: 'app.containers.AdminPage.FolderPermissions.folderManagerSectionTitle',
    defaultMessage: 'Folder managers',
  },
  searchFolderManager: {
    id: 'app.containers.AdminPage.FolderPermissions.searchFolderManager',
    defaultMessage: 'Search users',
  },
  noMatch: {
    id: 'app.containers.AdminPage.FolderPermissions.noMatch',
    defaultMessage: 'No match found',
  },
  deleteFolderManagerLabel: {
    id: 'app.containers.AdminPage.FolderPermissions.deleteFolderManagerLabel',
    defaultMessage: 'Delete',
  },
  addFolderManager: {
    id: 'app.containers.AdminPage.FolderPermissions.addFolderManager',
    defaultMessage: 'Add',
  },
});
