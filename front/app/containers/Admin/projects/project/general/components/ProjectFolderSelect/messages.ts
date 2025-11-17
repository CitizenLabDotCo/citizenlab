import { defineMessages } from 'react-intl';

export default defineMessages({
  projectFolderSelectTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectFolderSelectTitle1',
    defaultMessage: 'Folder',
  },
  adminProjectFolderSelectTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.adminProjectFolderSelectTooltip2',
    defaultMessage:
      'You can add your project to an folder now, or do it later in the project settings',
  },
  folderAdminProjectFolderSelectTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.folderAdminProjectFolderSelectTooltip2',
    defaultMessage:
      'As a folder manager, you can choose a folder when creating the project, but only an admin can change it afterward',
  },

  noFolderLabel: {
    id: 'app.containers.AdminPage.ProjectEdit.noFolderLabel',
    defaultMessage: '— No folder —',
  },
});
