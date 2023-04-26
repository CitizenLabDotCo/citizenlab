import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { Multiloc } from 'typings';
import { MembershipType } from 'api/groups/types';

export interface IMembershipTypeMap {
  manual: 'manual';
}

export interface IGroupDataAttributes {
  title_multiloc: Multiloc;
  slug?: string;
  memberships_count: number;
  membership_type: MembershipType;
}

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
