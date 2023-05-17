import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { ImageSizes, Multiloc, Locale } from 'typings';
import { TRole } from 'services/permissions/roles';

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

interface IChangePassword {
  current_password: string;
  password: string;
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
