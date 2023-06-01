import { Keys } from 'utils/cl-react-query/types';

import invitesKeys from './keys';

export type InvitesKeys = Keys<typeof invitesKeys>;

export type Sort =
  | 'email'
  | '-email'
  | 'last_name'
  | '-last_name'
  | 'created_at'
  | '-created_at'
  | 'invite_status'
  | '-invite_status';

export type SortAttribute =
  | 'email'
  | 'last_name'
  | 'created_at'
  | 'invite_status';

export type InviteStatus = 'pending' | 'accepted';

export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string | undefined;
  invite_status?: InviteStatus | undefined;
}

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
    type: 'invite_new_seats';
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
