import { IGroupData } from 'api/groups/types';

enum UsersEvents {
  membershipAdd = 'UserAddedToGroup',
  membershipAddFailed = 'UserAddedToGroupFailed',
  userDeletionFailed = 'UserDeleteFailed',
  membershipDeleteFailed = 'UserDeletedFromGroupFailed',
  userRoleChangeFailed = 'UserRoleChangedFailed',
}

export interface MembershipAdd {
  groupsIds: IGroupData['id'][];
}

export default UsersEvents;
