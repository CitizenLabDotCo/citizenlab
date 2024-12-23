export default {
  // UserTableActions
  addUsersToGroup: 'Clicked add users to group button',

  // Is fired once even if a user tries to add several redundant users
  addedRedundantUserToGroup:
    'Tried to add again one or more existing group member(s)',
  toggleAllUsers: 'Selected or Unselected all users',

  // GroupsListPanel
  createGroup: 'Clicked group creation button',

  // UsersGroup
  editGroup: 'Opened edit group modal',

  // app/components/admin/UserFilterConditions/index.tsx
  conditionAdd: 'Clicked add condition in smartgroups',

  // UserTable
  pagination: 'Clicked any pagination button in user section',
  toggleOneUser: 'Selected or unselected one user',
  adminChangeRole: 'Clicked an action to change the user role',
  sortChange: 'Changed sorting of users in the table',

  // UsersHeader
  searchInput: 'Entered user search input',
};
