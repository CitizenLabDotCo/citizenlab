import { IRelationship } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import basketsKeys from './keys';

export type BasketsKeys = Keys<typeof basketsKeys>;
export type BasketIdeaAttributes = { idea_id: string; votes?: number }[];

export interface IBasketData {
  id: string;
  type: string;
  attributes: {
    submitted_at: string;
    total_votes: number;
    'budget_exceeds_limit?': false;
  };
  relationships: {
    participation_context: {
      data: IRelationship;
    };
    user: {
      data: IRelationship;
    };
    ideas: {
      data: IRelationship[];
    };
  };
}

export interface IBasket {
  data: IBasketData;
}

export interface IUpdateBasket {
  id: string;
  submitted?: boolean | null;
  baskets_ideas_attributes?: BasketIdeaAttributes;
  participation_context_type: 'Project' | 'Phase';
}
export interface INewBasket {
  participation_context_id: string;
  participation_context_type: 'Project' | 'Phase';
  submitted?: boolean | null;
  baskets_ideas_attributes?: BasketIdeaAttributes;
}
