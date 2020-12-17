import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { Multiloc } from 'typings';

export interface IMembershipTypeMap {
  manual: 'manual';
}

export interface IGroupDataAttributes {
  title_multiloc: Multiloc;
  slug?: string;
  memberships_count: number;
  membership_type: MembershipType;
}

export type MembershipType = IMembershipTypeMap[keyof IMembershipTypeMap];

export interface IGroupData {
  id: string;
  type: 'group';
  attributes: IGroupDataAttributes;
}

export interface GroupDiff {
  title_multiloc?: IGroupData['attributes']['title_multiloc'];
  membership_type: IGroupData['attributes']['membership_type'];
}

export interface IGroups {
  data: IGroupData[];
}

export interface IGroup {
  data: IGroupData;
}

export function getGroups(streamParams: IStreamParams | null = null) {
  return streams.get<IGroups>({
    apiEndpoint: `${API_PATH}/groups`,
    ...streamParams,
    cacheStream: false,
  });
}

export function getGroup(
  groupId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IGroup>({
    apiEndpoint: `${API_PATH}/groups/${groupId}`,
    ...streamParams,
    cacheStream: false,
  });
}

export function addGroup(object: GroupDiff) {
  return streams.add<IGroups>(`${API_PATH}/groups`, { group: object });
}

export function updateGroup(groupId: string, object: GroupDiff) {
  return streams.update<IGroup>(`${API_PATH}/groups/${groupId}`, groupId, {
    group: object,
  });
}

export function deleteGroup(groupId: string) {
  return streams.delete(`${API_PATH}/groups/${groupId}`, groupId);
}
