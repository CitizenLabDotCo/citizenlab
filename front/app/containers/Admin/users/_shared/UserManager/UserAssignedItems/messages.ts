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
  foldersUserManages: {
    id: 'app.containers.Admin.users.UserAssignedItems.foldersUserManages',
    defaultMessage: 'Folders user manages',
  },
  thisUserCanManage: {
    id: 'app.containers.Admin.users.UserAssignedItems.thisUserCanManage',
    defaultMessage:
      'This user can manage the following folders, including the projects inside of them:',
  },
  projectsUserManages: {
    id: 'app.containers.Admin.users.UserAssignedItems.projectsUserManages',
    defaultMessage: 'Projects user manages',
  },
});
