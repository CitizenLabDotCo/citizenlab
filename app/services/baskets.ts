import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IRelationship, Multiloc } from 'typings';

const apiEndpoint = `${API_PATH}/baskets`;

export interface IBasketData {
  id: string;
  type: string;
  attributes: {
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
  };
  relationships: {
    participation_context: {
      data: IRelationship;
    };
    user: {
      data: IRelationship;
    };
    baskets_ideas: {
      id: string;
      basket_id: string;
      idea_id: string;
      created_at: string;
      updated_at: string;
    }[];
    ideas: {
      data: IRelationship[];
    }
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
  submitted_at?: string;
}

export function basketByIdStream(basketId: string) {
  return streams.get<IBasket>({ apiEndpoint: `${apiEndpoint}/${basketId}` });
}

export function addBasket(object: INewBasket) {
  return streams.add<IBasket>(apiEndpoint, { basket: object });
}

export function updateBasket(basketId: string, object) {
  return streams.update<IBasket>(`${apiEndpoint}/${basketId}`, basketId, { basket: object });
}

export function deleteBasket(basketId: string) {
  return streams.delete(`${apiEndpoint}/${basketId}`, basketId);
}
