import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

export interface IInviteData {
  id: string;
  type: 'invite';
  attributes: {
    token: 'string';
    accepted_at: string;
    updated_at: string;
    created_at: string;
    activate_invite_url: string;
  };
  relationships: {
    invitee: {
      data: {
        id: string;
        type: 'votable';
      };
    };
    inviter: {
      data: {
        id: string;
        type: 'user';
      };
    };
  };
}

export interface IInvitesNewSeats {
  data: {
    attributes: {
      newly_added_admins_number: number;
      newly_added_moderators_number: number;
    };
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
export interface IInviteError {
  error: string;
  raw_error: string;
  row?: number | undefined;
  rows?: number[] | undefined;
  value?: number | string | undefined;
  payload?: Record<string, any>;
}

type AdminRole = {
  type: 'admin';
};

type ProjectModeratorRole = {
  type: 'project_moderator';
  project_id: string;
};

type Roles = (AdminRole | ProjectModeratorRole)[] | null | undefined;

export interface INewBulkInvite {
  locale?: string | null | undefined;
  roles?: Roles;
  group_ids?: string[] | null | undefined;
  invite_text?: string | null | undefined;
}

export interface INewBulkInviteEmails extends INewBulkInvite {
  emails: string[];
}

export interface INewBulkXLSXInviteXLSX extends INewBulkInvite {
  xlsx: string;
}

export function invitesStream(streamParams: IStreamParams | null = null) {
  return streams.get<IInvites>({
    apiEndpoint: `${API_PATH}/invites`,
    ...streamParams,
    cacheStream: false,
  });
}

export async function bulkInviteEmails(object: INewBulkInviteEmails) {
  const response = await streams.add(`${API_PATH}/invites/bulk_create`, {
    invites: object,
  });
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/invites`] });
  invalidateSeatsCache();
  return response;
}

export async function bulkInviteXLSX(object: INewBulkXLSXInviteXLSX) {
  const response = await streams.add(`${API_PATH}/invites/bulk_create_xlsx`, {
    invites: object,
  });
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/invites`] });
  invalidateSeatsCache();
  return response;
}

export async function bulkInviteCountNewSeatsEmails(
  object: INewBulkInviteEmails
) {
  const response = await streams.add<IInvitesNewSeats>(
    `${API_PATH}/invites/count_new_seats`,
    { invites: object }
  );
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/invites`] });
  return response;
}

export async function bulkInviteCountNewSeatsXLSX(
  object: INewBulkXLSXInviteXLSX
) {
  const response = await streams.add<IInvitesNewSeats>(
    `${API_PATH}/invites/count_new_seats_xlsx`,
    { invites: object }
  );
  await streams.fetchAllWith({ apiEndpoint: [`${API_PATH}/invites`] });
  return response;
}

export function deleteInvite(inviteId: string) {
  return streams.delete(`${API_PATH}/invites/${inviteId}`, inviteId);
}
