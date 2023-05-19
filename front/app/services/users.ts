import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';
import { TRole } from 'services/permissions/roles';
import { queryClient } from 'utils/cl-react-query/queryClient';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';
import requirementsKeys from 'api/authentication/authentication_requirements/keys';
import userCountKeys from 'api/users_count/keys';

const apiEndpoint = `${API_PATH}/users`;

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

interface IChangePassword {
  current_password: string;
  password: string;
}

export function usersStream(streamParams: IStreamParams | null = null) {
  return streams.get<IUsers>({ apiEndpoint, ...streamParams });
}

export function userByIdStream(userId: string) {
  return streams.get<IUser>({ apiEndpoint: `${apiEndpoint}/${userId}` });
}

export function userBySlugStream(userSlug: string) {
  return streams.get<IUser>({
    apiEndpoint: `${apiEndpoint}/by_slug/${userSlug}`,
  });
}

export async function updateUser(userId: string, object: IUserUpdate) {
  const response = await streams.update<IUser>(
    `${apiEndpoint}/${userId}`,
    userId,
    { user: object }
  );

  await streams.fetchAllWith({
    dataId: [userId],
    apiEndpoint: [`${API_PATH}/groups`, `${API_PATH}/users`],
  });

  // Invalidate seats if the user's roles have changed
  if (object.roles) {
    invalidateSeatsCache();
  }

  queryClient.invalidateQueries({ queryKey: requirementsKeys.all() });
  queryClient.invalidateQueries({
    queryKey: userCountKeys.items(),
  });

  return response;
}

export async function changePassword(object: IChangePassword) {
  const response = await streams.add<IUser>(`${apiEndpoint}/update_password`, {
    user: {
      current_password: object.current_password,
      new_password: object.password,
    },
  });
  return response;
}

export async function deleteUser(userId: string) {
  const response = await streams.delete(`${apiEndpoint}/${userId}`, userId);
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/groups`, `${API_PATH}/users`],
  });

  invalidateSeatsCache();

  queryClient.invalidateQueries({
    queryKey: userCountKeys.items(),
  });
  return response;
}
