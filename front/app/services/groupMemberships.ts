import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

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
