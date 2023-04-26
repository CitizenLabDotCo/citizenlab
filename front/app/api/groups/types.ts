import { Multiloc } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import groupsKeys from './keys';

export type GroupsKeys = Keys<typeof groupsKeys>;

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

export interface GroupsQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  membershipType?: MembershipType;
}
