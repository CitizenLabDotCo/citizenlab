import { IRelationship } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import basketsKeys from './keys';

export type BasketsKeys = Keys<typeof basketsKeys>;

export interface IBasketData {
  id: string;
  type: string;
  attributes: {
    submitted_at: string;
    total_budget: number;
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

export interface INewBasket {
  user_id: string;
  participation_context_id: string;
  participation_context_type: 'Project' | 'Phase';
  idea_ids?: string[];
  submitted_at?: string | null;
}
