const blockedUsersCountKeys = {
  all: () => [{ type: 'blocked_users_count' }],
  items: () => [{ ...blockedUsersCountKeys.all()[0], operation: 'item' }],
};

export default blockedUsersCountKeys;
