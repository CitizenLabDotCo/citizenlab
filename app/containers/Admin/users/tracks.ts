export default {
  // UserTableActions
  addUsersToGroup: {
    name: 'Clicked add users to group button',
  },
  addedRedundantUserToGroup: {
    // Is fired once even if a user tries to add several redundant users
    name: 'Tried to add again one or more existing group member(s)',
  },
  toggleAllUsers: {
    name: 'Selected or Unselected all users',
  },
  // GroupsListPanel
  createGroup: {
    name: 'Clicked group creation button',
  },
  // UsersGroup
  editGroup: {
    name: 'Opened edit group modal',
  },
  // app/components/admin/UserFilterConditions/index.tsx
  conditionAdd: {
    name: 'Clicked add condition in smartgroups',
  },
  // UserTable
  pagination: {
    name: 'Clicked any pagination button in user section',
  },
  toggleOneUser: {
    name: 'Selected or unselected one user',
  },
  adminToggle: {
    name: 'Clicked an admin toggle',
  },
  sortChange: {
    name: 'Changed sorting of users in the table',
  },
  // UsersHeader
  searchInput: {
    name: 'Entered user search input',
  },
};
