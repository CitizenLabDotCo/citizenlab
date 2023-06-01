import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

export interface IInvitesNewSeats {
  data: {
    attributes: {
      newly_added_admins_number: number;
      newly_added_moderators_number: number;
    };
  };
}

export interface IInviteError {
  error: string;
  raw_error: string;
  row?: number | undefined;
  rows?: number[] | undefined;
  value?: number | string | undefined;
  payload?: Record<string, any>;
  inviter_email?: string | null;
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
