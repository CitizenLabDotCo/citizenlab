import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc, API } from 'typings';

export interface IGroupData {
  id: string;
  type: 'groups';
  attributes: {
    title_multiloc: Multiloc;
    slug: string;
    memberships_count: number;
  };
}

export interface GroupDiff {
  title_multiloc?: Multiloc;
}

export interface IGroups {
  data: IGroupData[];
}
export interface IGroup {
  data: IGroupData;
}

export interface Membership {
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

export interface FoundUser {
  id: string;
  type: 'users';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar: API.ImageSizes;
    is_member: boolean;
    email: string;
  };
}

export interface MembershipsResponse {
  data: Membership[];
}

export function listGroups(streamParams: IStreamParams | null = null) {
  return streams.get<IGroups>({ apiEndpoint: `${API_PATH}/groups`, ...streamParams });
}

export function getGroup(groupId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IGroup>({ apiEndpoint: `${API_PATH}/groups/${groupId}`, ...streamParams });
}

export function addGroup(object: GroupDiff) {
  return streams.add<IGroups>(`${API_PATH}/groups`, { group: object });
}

export function deleteGroup(groupId: string) {
  return streams.delete(`${API_PATH}/groups/${groupId}`, groupId);
}

export function listMembership(groupId: string, streamParams: IStreamParams | null = null) {
  return streams.get<MembershipsResponse>({ apiEndpoint: `${API_PATH}/groups/${groupId}/memberships`, ...streamParams });
}

export function findMembership(groupId: string, streamParams: IStreamParams | null = null) {
  return streams.get<{data: FoundUser[]}>({ apiEndpoint: `${API_PATH}/groups/${groupId}/memberships/users_search`, ...streamParams, cacheStream: false });
}

export async function deleteMembership(membershipId: string) {
  const response = await streams.delete(`${API_PATH}/memberships/${membershipId}`, membershipId);
  await listGroups().fetch();
  return response;
}

export async function addMembership(groupId: string, user_id: string) {
  const response = await streams.add(`${API_PATH}/groups/${groupId}/memberships`, { membership: { user_id } });
  await listGroups().fetch();
  return response;
}
