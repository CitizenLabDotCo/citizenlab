import { Multiloc } from 'component-library/utils/typings';
import { IRelationship } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import managementFeedKeys from './keys';

export type ManagementFeedKeys = Keys<typeof managementFeedKeys>;

export type IQueryParameters = {
  pageNumber?: number;
  pageSize?: number;
  projectIds?: string[];
  userIds?: string[];
  sort?: Sort;
};
type Sort = '-acted_at' | 'acted_at';
export interface ManagementFeedData {
  id: string;
  type: 'activity';
  attributes: {
    action: 'created' | 'changed' | 'deleted';
    acted_at: string;
    item_id: string;
    project_id: string;
    item_type: 'idea' | 'phase' | 'project' | 'folder';
    item_slug: string | null;
    item_title_multiloc: Multiloc;
    change: Record<string, any[]> | null;
    item_exists: boolean;
  };
  relationships: {
    user: { data: IRelationship | null };
    item: { data: IRelationship | null };
  };
}

export interface ManagementFeed {
  data: ManagementFeedData[];
  links: {
    self: string;
    first: string;
    last: string;
    prev: string | null;
    next: string | null;
  };
}
