import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IInviteData {
  id: string;
  type: 'invites';
  attributes: {
    token: 'string';
    accepted_at: string | null;
    updated_at: string | null;
    created_at: string | null;
    activate_invite_url: string
  };
  relationships: {
    invitee: {
      data: {
        id: string;
        type: 'votables';
      }
    },
    inviter: {
      data: {
        id: string;
        type: 'users';
      }
    }
  };
}

export interface IInvites {
  data: IInviteData[];
}

export interface IInvite {
  data: IInviteData;
}

export interface INewBulkXLSXInvite {
  xlsx: string;
  locale?: string;
  roles?: [{ type: 'admin'}];
  group_ids?: string[];
  invite_text?: string;
}

export function invitesStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInvites>({ apiEndpoint: `${API_PATH}/invites`, ...streamParams });
}

export function bulkInviteXLSX(object: INewBulkXLSXInvite) {
  return streams.add<IInvites>(`${API_PATH}/invites/bulk_create_xlsx`, { invites: object });
}
