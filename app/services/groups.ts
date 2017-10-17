import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

export interface IGroupData {
  id: string;
  type: 'groups';
  attributes: {
    title_multiloc: Multiloc;
    slug: string;
    memberships_count: number;
  };
}

export interface IGroups {
  data: IGroupData[];
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

export interface MembershipsResponse {
  data: Membership[];
}

export function listGroups(streamParams: IStreamParams<IGroups> | null = null) {
  return streams.get<IGroups>({ apiEndpoint: `${API_PATH}/groups`, ...streamParams });
}

export function listMembership(groupId: string, streamParams: IStreamParams<MembershipsResponse> | null = null) {
  return streams.get<MembershipsResponse>({ apiEndpoint: `${API_PATH}/groups/${groupId}/memberships`, ...streamParams });
}
