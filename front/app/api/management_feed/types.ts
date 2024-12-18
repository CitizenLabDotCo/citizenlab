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

type ItemType = 'project' | 'phase' | 'folder' | 'idea';

type CommonAction = 'created' | 'changed' | 'deleted';
type ProjectSpecificAction =
  | 'project_review_requested'
  | 'project_review_approved';

type Relationships = {
  user: { data: IRelationship | null };
  item: { data: IRelationship | null };
};

type BaseAttributes<TItemType, TAction> = {
  action: TAction;
  acted_at: string;
  item_id: string;
  project_id: string;
  item_type: TItemType;
  item_slug: string | null;
  item_title_multiloc: Multiloc;
  change: Record<string, any[]> | null;
  item_exists: boolean;
};

type Attributes =
  | BaseAttributes<ItemType, CommonAction>
  | BaseAttributes<'project', ProjectSpecificAction>;

export type ManagementFeedAction = CommonAction | ProjectSpecificAction;

export type ManagementFeedData = {
  id: string;
  type: 'activity';
  attributes: Attributes;
  relationships: Relationships;
};

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
