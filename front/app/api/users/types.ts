import { TRole } from 'utils/permissions/roles';
import { ImageSizes, Locale, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import usersKeys from './keys';

export type UsersKeys = Keys<typeof usersKeys>;

export interface UserCheckResponse {
  data: {
    type: 'check';
    attributes: {
      action: Action;
    };
  };
}

type Action = 'password' | 'confirm' | 'terms';

export interface IUserAttributes {
  first_name?: string | null;
  last_name?: string | null;
  slug: string;
  locale: Locale;
  highest_role:
    | 'super_admin'
    | 'admin'
    | 'project_folder_moderator'
    | 'project_moderator'
    | 'user';
  bio_multiloc: Multiloc;
  block_end_at?: string;
  block_reason?: string;
  block_start_at?: string;
  blocked?: boolean;
  registration_completed_at: string | null;
  created_at: string;
  updated_at: string;
  unread_notifications: number;
  invite_status: 'pending' | 'accepted' | null;
  confirmation_required: boolean;
  custom_field_values?: Record<string, any>;
  avatar?: ImageSizes;
  roles?: TRole[];
  email?: string;
  gender?: 'male' | 'female' | 'unspecified';
  birthyear?: number;
  domicile?: string;
  education?: string;
  verified?: boolean;
  no_name?: boolean;
  no_password?: boolean;
}

export interface IUserData {
  id: string;
  type: 'user';
  attributes: IUserAttributes;
}

export interface IUserLinks {
  self: string;
  first: string;
  prev: string;
  next: string;
  last: string;
}

export interface IUsers {
  data: IUserData[];
  links: IUserLinks;
}

export interface IUser {
  data: IUserData;
}

export interface IUserUpdate {
  userId: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  new_email?: string;
  password?: string;
  locale?: string;
  avatar?: string | null;
  roles?: TRole[];
  bio_multiloc?: Multiloc;
  custom_field_values?: Record<string, any>;
}

export interface IChangePassword {
  current_password: string;
  password: string;
}

export type Sort =
  | 'created_at'
  | '-created_at'
  | 'last_name'
  | '-last_name'
  | 'email'
  | '-email'
  | 'role'
  | '-role';

export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string;
  group?: string;
  can_moderate_project?: string;
  can_moderate?: true;
  can_admin?: true;
  only_blocked?: boolean;
  not_citizenlab_member?: boolean;
  include_inactive?: boolean;
  // Pass project id to exclude all users who can moderate
  // the project
  is_not_project_moderator?: string;
  // Pass folder id to exclude all users who can moderate
  // the folder
  is_not_folder_moderator?: string;
}
