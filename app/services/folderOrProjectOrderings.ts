import streams from 'utils/streams';

import { API_PATH } from 'containers/App/constants';
const apiEndpoint = `${API_PATH}/project_holder_orderings`;

export interface IFolderOrProjectOrderingData {
  id: string;
  type: 'project_or_folder_ordering';
  attributes: {
    ordering: number;
  };
  relationships: {
    project_holder: {
      data: { id: string, type: 'project' | 'project_folder' };
    }
  };
}

export function listFolderOrProjectOrderings() {
  return streams.get<{ data: IFolderOrProjectOrderingData[] }>({ apiEndpoint });
}

export async function reorderFolderOrProject(orderingId: string, newOrder: number) {
  return streams.update<{ data: IFolderOrProjectOrderingData }>(
    `${apiEndpoint}/${orderingId}`,
    orderingId,
    { project_or_folder_ordering: { ordering: newOrder } });
}
