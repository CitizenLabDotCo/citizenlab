import streams from 'utils/streams';

import { API_PATH } from 'containers/App/constants';
const apiEndpoint = `${API_PATH}/admin_publications`;

export interface IAdminPublicationData {
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

export function listAdminPublications() {
  return streams.get<{ data: IAdminPublicationData[] }>({ apiEndpoint });
}

export async function reorderadminPublication(orderingId: string, newOrder: number) {
  return streams.update<{ data: IAdminPublicationData }>(
    `${apiEndpoint}/${orderingId}`,
    orderingId,
    { project_or_folder_ordering: { ordering: newOrder } });
}
