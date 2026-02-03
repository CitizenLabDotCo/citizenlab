import { Multiloc, IRelationship } from 'typings';

import { IIdeaQueryParameters } from 'api/ideas/types';

import { Keys } from 'utils/cl-react-query/types';

import globalTopicsKeys from './keys';

export type GlobalTopicsKeys = Keys<typeof globalTopicsKeys>;

export interface IGlobalTopicData {
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
    is_default: boolean;
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

export interface IGlobalTopic {
  data: IGlobalTopicData;
}

export interface IGlobalTopics {
  data: IGlobalTopicData[];
}

export interface IGlobalTopicsQueryParams {
  sort?: 'new' | 'custom' | 'projects_count' | '-projects_count';
  forHomepageFilter?: boolean;
  forOnboarding?: boolean;
  includeStaticPages?: boolean;
  ideas?: IIdeaQueryParameters;
}

export interface IGlobalTopicAdd {
  title_multiloc: Multiloc;
  description_multiloc: Multiloc;
  is_default?: boolean;
}

export interface IGlobalTopicUpdate {
  id: string;
  title_multiloc?: Multiloc;
  description_multiloc?: Multiloc;
  include_in_onboarding?: boolean;
  is_default?: boolean;
}
