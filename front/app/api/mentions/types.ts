import { ImageSizes } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import mentionsKeys from './keys';

export type MentionsKeys = Keys<typeof mentionsKeys>;

export type IQueryParameters = {
  mention: string;
  idea_id?: string;
  moderators_only?: boolean;
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
