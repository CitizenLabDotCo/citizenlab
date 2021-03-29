import { defineMessages } from 'react-intl';

export default defineMessages({
  projectFolderSelectTitle: {
    id: 'app.containers.AdminPage.ProjectEdit.projectFolderSelectTitle',
    defaultMessage: 'Add project to a folder?',
  },
  adminProjectFolderSelectTooltip: {
    id: 'app.containers.AdminPage.ProjectEdit.adminProjectFolderSelectTooltip',
    defaultMessage:
      'You can add your project to an existing folder. You can also do this later in the Projects tab.',
  },
  folderAdminProjectFolderSelectTooltip: {
    id:
      'app.containers.AdminPage.ProjectEdit.folderAdminProjectFolderSelectTooltip',
    defaultMessage:
      'You will need to add the project to a folder that you have admin rights over.',
  },
  optionYes: {
    id: 'app.containers.AdminPage.ProjectEdit.optionYes',
    defaultMessage: 'Yes (select folder)',
  },
  optionNo: {
    id: 'app.containers.AdminPage.ProjectEdit.optionNo',
    defaultMessage: 'No',
  },
  folderSelectError: {
    id: 'app.containers.AdminPage.ProjectEdit.folderSelectError',
    defaultMessage: 'Select a folder to add this project to.',
  },
});
