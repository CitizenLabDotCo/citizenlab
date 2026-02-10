import { ImageSizes, SupportedLocale, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';
import { TRole } from 'utils/permissions/roles';

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

// token only used if user_confirmation feature is disabled
type Action = 'password' | 'confirm' | 'terms' | 'token';

type RequirementStatus = 'dont_ask' | 'require' | 'satisfied' | 'ask';

export type OnboardingType = {
  topics_and_areas?: RequirementStatus;
};

export type HighestRole =
  | 'super_admin'
  | 'admin'
  | 'project_folder_moderator'
  | 'project_moderator'
  | 'user';

export interface IUserAttributes {
  first_name?: string | null;
  last_name?: string | null;
  slug: string;
  locale: SupportedLocale;
  highest_role: HighestRole;
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
  onboarding?: OnboardingType;
  avatar?: ImageSizes;
  roles?: TRole[];
  email?: string;
  gender?: 'male' | 'female' | 'unspecified';
  birthyear?: number;
  domicile?: string;
  verified?: boolean;
  no_name?: boolean;
  display_name?: string | null;
  no_password?: boolean;
  followings_count: number;
  last_active_at?: string | null;
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
  userId?: string;
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
  onboarding?: OnboardingType;
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
  | '-role'
  | 'last_active_at'
  | '-last_active_at';

export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  sort?: Sort;
  search?: string;
  group?: string;
  can_moderate_project?: string;
  can_moderate?: true;
  can_admin?: boolean;
  only_blocked?: boolean;
  not_citizenlab_member?: boolean;
  include_inactive?: boolean;
  // Pass project id to exclude all users who can moderate
  // the project
  is_not_project_moderator?: string;
  // Pass folder id to exclude all users who can moderate
  // the folder
  is_not_folder_moderator?: string;
  // Admin users that can approve project review requests
  project_reviewer?: boolean;
  // Pass project id to filter users who participated in the project
  project?: string;
}
