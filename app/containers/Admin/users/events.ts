import { IGroupData } from 'services/groups';

enum UsersEvents {
  membershipAdd = 'UserAddedToGroup',
  membershipDelete = 'UserDeletedFromGroup',
}

export interface MembershipAdd {
  groupsIds: IGroupData['id'][];
}

export default UsersEvents;
