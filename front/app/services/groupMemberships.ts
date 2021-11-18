import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ImageSizes } from 'typings';
// import { getGroups, getGroup } from 'services/groups';
// import { usersStream } from 'services/users';

export interface IGroupMembership {
  id: string;
  type: 'membership';
  relationships: {
    user: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface IGroupMemberships {
  data: IGroupMembership[];
}

export interface IGroupMembershipsFoundUserData {
  id: string;
  type: 'user';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar?: ImageSizes;
    is_member?: boolean;
    // the is_moderator attribute is absent, except in moderators/users_search if the project_id was provided as a parameter
    // this is only the case in the findMembership function in moderators.ts at the time of this writing
    is_moderator?: boolean;
    email: string;
  };
}

export function getGroupMemberships(
  groupId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IGroupMemberships>({
    apiEndpoint: `${API_PATH}/groups/${groupId}/memberships`,
    ...streamParams,
    cacheStream: false,
  });
}

export async function addGroupMembership(groupId: string, user_id: string) {
  const response = await streams.add<IGroupMembership>(
    `${API_PATH}/groups/${groupId}/memberships`,
    { membership: { user_id } }
  );
  return response;
}

export async function deleteMembershipByUserId(
  groupId: string,
  userId: string
) {
  const response = await streams.delete(
    `${API_PATH}/groups/${groupId}/memberships/by_user_id/${userId}`,
    userId
  );
  return response;
}
