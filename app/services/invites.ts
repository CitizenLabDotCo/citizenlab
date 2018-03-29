import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

export interface IInviteData {
  id: string;
  type: 'invites';
  attributes: {
    token: 'string';
    accepted_at: string;
    updated_at: string;
    created_at: string;
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
  links: {
    self: string;
    first: string;
    prev: string;
    next: string;
    last: string;
  };
}

export interface IInvite {
  data: IInviteData;
}

export interface INewBulkXLSXInvite {
  xlsx: string;
  locale?: string | null | undefined;
  roles?: [{ type: 'admin'}] | null | undefined;
  group_ids?: string[] | null | undefined;
  invite_text?: string | null | undefined;
}

export function invitesStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInvites>({ apiEndpoint: `${API_PATH}/invites`, ...streamParams });
}

export function bulkInviteXLSX(object: INewBulkXLSXInvite) {
  return streams.add<IInvites>(`${API_PATH}/invites/bulk_create_xlsx`, { invites: object });
}

export function deleteInvite(inviteId: string) {
  return streams.delete(`${API_PATH}/invites/${inviteId}`, inviteId);
}
