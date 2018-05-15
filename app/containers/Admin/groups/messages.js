import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.AdminPage.Groups.helmetTitle',
    defaultMessage: 'Admin - Groups dashboard',
  },
  helmetDescription: {
    id: 'app.containers.AdminPage.Groups.helmetDescription',
    defaultMessage: 'List of groups on the platform',
  },
  editTitle: {
    id: 'app.containers.AdminPage.Groups.editTitle',
    defaultMessage: 'Editing a group',
  },
  addGroupTitle: {
    id: 'app.containers.AdminPage.Groups.addGroupTitle',
    defaultMessage: 'Create a new group',
  },
  emptyGroup: {
    id: 'app.containers.AdminPage.Users.Groups.emptyGroup',
    defaultMessage: 'There is no users in this group yet',
  },
  goToAllUsers: {
    id: 'app.containers.AdminPage.Users.Groups.goToAllUsers',
    defaultMessage: 'Go on the {allUsersLink} tab to move users manually.',
  },
  allUsers: {
    id: 'app.containers.AdminPage.Users.Groups.allUsers',
    defaultMessage: 'All Users',
  },
  emptySmartGroup: {
    id: 'app.containers.AdminPage.Users.Groups.emptySmartGroup',
    defaultMessage: 'This group is empty',
  },
  noUserMatching: {
    id: 'app.containers.AdminPage.Users.Groups.noUserMatching',
    defaultMessage: 'No registered user match the criteria',
  },
});
