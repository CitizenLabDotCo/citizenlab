import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { ILinks } from 'typings';

const apiEndpoint = `${API_PATH}/project_holder_orderings`;

export interface IProjectHolderOrderingData {
  id: string;
  type: 'project_holder_orderings';
  attributes: {
    ordering: number;
  };
  relationships: {
    project_holder: {
      data: {
        id: string,
        type: 'project' | 'project_folder'
      };
    }
  };
}

export interface IProjectHolderOrdering {
  data: IProjectHolderOrderingData[];
  links: ILinks;
}

export function listProjectHolderOrderings(streamParams: IStreamParams | null = null) {
  return streams.get<IProjectHolderOrdering>({ apiEndpoint, ...streamParams });
}

export async function reorderProjectHolder(orderingId: string, newOrder: number) {
  return streams.update<IProjectHolderOrdering>(
    `${apiEndpoint}/${orderingId}/reorder`,
    orderingId,
    {
      project_holder_ordering: {
        ordering: newOrder
      }
    }
  );
}
