import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';
import projectsKeys from 'api/projects/keys';
import { queryClient } from 'utils/cl-react-query/queryClient';

const apiEndpoint = `${API_PATH}/baskets`;

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

export function basketByIdStream(
  basketId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IBasket>({
    apiEndpoint: `${apiEndpoint}/${basketId}`,
    ...streamParams,
  });
}

export async function addBasket(object: INewBasket) {
  const basket = await streams.add<IBasket>(apiEndpoint, { basket: object });

  if (object.participation_context_type === 'Project') {
    queryClient.invalidateQueries({
      queryKey: projectsKeys.item({ id: object.participation_context_id }),
    });
  } else {
    await streams.fetchAllWith({ dataId: [object.participation_context_id] });
  }
  return basket;
}

export function updateBasket(basketId: string, object: Partial<INewBasket>) {
  return streams.update<IBasket>(`${apiEndpoint}/${basketId}`, basketId, {
    basket: object,
  });
}
