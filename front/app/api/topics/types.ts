import { Multiloc, IRelationship } from 'typings';

import { IIdeaQueryParameters } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import topicsKeys from './keys';

export type TopicsKeys = Keys<typeof topicsKeys>;

export interface ITopicData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    icon: string;
    ordering: number;
    static_page_ids: string[];
    followers_count: number;
    include_in_onboarding: boolean;
    default: boolean;
  };
  relationships: {
    static_pages: {
      data: IRelationship[];
    };
    user_follower: {
      data: IRelationship | null;
    };
  };
}

export interface ITopic {
  data: ITopicData;
}

export interface ITopics {
  data: ITopicData[];
}

export interface ITopicsQueryParams {
  sort?:
    | 'new'
    | 'custom'
    | 'projects_count'
    | '-projects_count'
    | '-ideas_count';
  forHomepageFilter?: boolean;
  forOnboarding?: boolean;
  includeStaticPages?: boolean;
  ideas?: IIdeaQueryParameters;
}

export interface ITopicAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  default?: boolean;
}

export interface ITopicUpdate {
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  include_in_onboarding?: boolean;
  default?: boolean;
}
