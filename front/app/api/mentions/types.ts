import { Keys } from 'utils/cl-react-query/types';
import mentionsKeys from './keys';
import { ImageSizes } from 'typings';

export type MentionsKeys = Keys<typeof mentionsKeys>;

export type MentionRoles = 'admin' | 'moderator';

export type IQueryParameters = {
  mention: string;
  post_id?: string;
  post_type?: 'Idea' | 'Initiative';
  // An array of MentionRoles?
  roles?: MentionRoles[];
};

export interface IMentionData {
  id: string;
  type: 'user';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar: ImageSizes;
  };
}

export interface IMentions {
  data: IMentionData[];
}
