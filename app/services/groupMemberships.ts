import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams, IInputStreamParams } from 'utils/streams';
import { API } from 'typings';
import { getGroups, getGroup } from 'services/groups';
import { usersStream } from 'services/users';

export interface IGroupMembership {
  id: string;
  type: 'memberships';
  relationships: {
    user: {
      data: {
        id: string;
        type: 'users';
      };
    };
  };
}

export interface IGroupMemberships {
  data: IGroupMembership[];
}

export interface IGroupMembershipsFoundUserData {
  id: string;
  type: 'users';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar: API.ImageSizes;
    is_member?: boolean;
    is_moderator?: boolean;
    email: string;
  };
}

export interface IGroupMembershipsFoundUsers {
  data: IGroupMembershipsFoundUserData[];
}

export function getGroupMemberships(groupId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IGroupMemberships>({ apiEndpoint: `${API_PATH}/groups/${groupId}/memberships`, ...streamParams });
}

export function searchGroupMemberships(groupId: string, search: string, streamParams: IStreamParams | null = null) {
  const apiEndpoint = `${API_PATH}/groups/${groupId}/memberships/users_search`;

  const mergedStreamParams: IStreamParams = {
    ...streamParams,
    queryParameters: {
      ...(streamParams && streamParams.queryParameters ? streamParams.queryParameters : null),
      search
    }
  };

  const streamInputParams: IInputStreamParams = {
    apiEndpoint,
    ...mergedStreamParams,
    cacheStream: false
  };

  return streams.get<IGroupMembershipsFoundUsers>(streamInputParams);
}

export async function deleteGroupMembership(membershipId: string) {
  const response = await streams.delete(`${API_PATH}/memberships/${membershipId}`, membershipId);
  await getGroups().fetch();
  return response;
}

export async function addGroupMembership(groupId: string, user_id: string) {
  const response = await streams.add<IGroupMembership>(`${API_PATH}/groups/${groupId}/memberships`, { membership: { user_id } });
  await getGroups().fetch();
  await getGroup(groupId).fetch();
  await usersStream().fetch();
  return response;
}

export async function deleteMembershipByUserId(groupId: string, userId: string) {
  const response = await streams.delete(`${API_PATH}/groups/${groupId}/memberships/by_user_id/${userId}`, groupId);
  await getGroups().fetch();
  await getGroup(groupId).fetch();
  await usersStream().fetch();
  return response;
}
