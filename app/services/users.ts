import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/users`;

export interface IUserData {
  id: string;
  type: string;
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    locale: string;
    avatar: {
      small: string;
      medium: string;
      large: string;
    },
    roles: any[],
    bio_multiloc: {},
    created_at: string;
    updated_at: string;
    email: string;
    gender: 'male' | 'female';
    birthyear: number;
    domicile: string;
    education: string;
  };
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

export function observeUsers(streamParams: IStreamParams<IUsers> | null = null) {
  return streams.create<IUsers>({ apiEndpoint, ...streamParams });
}
