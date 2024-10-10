import { Keys } from 'utils/cl-react-query/types';

import avatarsKeys from './keys';

export type AvatarsKeys = Keys<typeof avatarsKeys>;

export interface IAvatarData {
  id: string;
  type: string;
  attributes: {
    avatar: {
      small: string;
      medium: string;
      large: string;
    };
  };
}

export interface IAvatar {
  data: IAvatarData;
}

export interface IAvatars {
  data: IAvatarData[];
  meta: {
    total: number;
  };
}

export type InputParameters = {
  context_type?: 'project' | 'group' | 'idea';
  context_id?: string;
  limit?: number;
  enabled?: boolean;
};
