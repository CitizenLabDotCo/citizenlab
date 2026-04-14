import { defineMessages } from 'react-intl';

export default defineMessages({
  lockedProject: {
    id: 'app.containers.Admin.users.UserAssignedItems.lockedProject',
    defaultMessage:
      'This project is in a folder that the user can manage. Therefore, the user can also manage this project.',
  },
  remove: {
    id: 'app.containers.Admin.users.UserAssignedItems.remove',
    defaultMessage: 'Remove',
  },
  asAnAdmin: {
    id: 'app.containers.Admin.users.UserAssignedItems.asAnAdmin',
    defaultMessage:
      'As an admin, this user can moderate all folders and projects.',
  },
  foldersUserManages: {
    id: 'app.containers.Admin.users.UserAssignedItems.foldersUserManages',
    defaultMessage: 'Folders user manages',
  },
  thisUserCanManageFolders: {
    id: 'app.containers.Admin.users.UserAssignedItems.thisUserCanManageFolders',
    defaultMessage:
      'This user can manage the following folders, including the projects inside of them:',
  },
  projectsUserManages: {
    id: 'app.containers.Admin.users.UserAssignedItems.projectsUserManages',
    defaultMessage: 'Projects user manages',
  },
  noItemsAssigned: {
    id: 'app.containers.Admin.users.UserAssignedItems.noItemsAssigned',
    defaultMessage: 'No items assigned to this user.',
  },
  spacesUserManages: {
    id: 'app.containers.Admin.users.UserAssignedItems.spacesUserManages',
    defaultMessage: 'Spaces user manages',
  },
  thisUserCanManageSpaces: {
    id: 'app.containers.Admin.users.UserAssignedItems.thisUserCanManageSpaces',
    defaultMessage:
      'This user can manage the following spaces, including the folders and projects inside of them:',
  },
});
