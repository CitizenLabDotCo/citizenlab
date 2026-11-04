import { ILinks } from 'typings';

import { IUserData } from 'api/users/types';

import { Keys } from 'utils/cl-react-query/types';

import volunteersKeys from './keys';

export type VolunteersKeys = Keys<typeof volunteersKeys>;

export type VolunteersSort = 'created_at' | '-created_at';

export interface IVolunteersParameters {
  phaseId: string;
  causes?: string[];
  search?: string;
  sort?: VolunteersSort;
  'page[number]'?: number;
  'page[size]'?: number;
}

export interface IVolunteerData {
  id: string;
  type: 'volunteer';
  attributes: {
    created_at: string;
    updated_at: string;
  };
  relationships: {
    cause: { data: { id: string; type: 'cause' } };
    user: { data: { id: string; type: 'user' } };
  };
}

export interface IVolunteers {
  data: IVolunteerData[];
  links: ILinks;
  included: IUserData[];
  meta: { total: number };
}
