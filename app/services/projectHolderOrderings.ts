import streams from 'utils/streams';

import { API_PATH } from 'containers/App/constants';
const apiEndpoint = `${API_PATH}/project_holder_orderings`;

/*
  Data structure to handle the order when there's a mix of projects and folders,
  as seen in the admin project overview when the folders feature is enabled.
*/

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

export function listProjectHolderOrderings() {
  return streams.get<{ data: IProjectHolderOrderingData[] }>({ apiEndpoint });
}

export async function reorderProjectHolder(orderingId: string, newOrder: number) {
  return streams.update<{ data: IProjectHolderOrderingData }>(
    `${apiEndpoint}/${orderingId}/reorder`,
    orderingId,
    {
      project_holder_ordering: {
        ordering: newOrder
      }
    }
  );
}
