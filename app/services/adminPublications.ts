import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { ILinks } from 'typings';
import { PublicationStatus } from 'services/projects';

const apiEndpoint = `${API_PATH}/admin_publications`;

/*
  Data structure to handle the ordering of published projects and folders.
  Projects and folders are not included, they have to be fetched separately.
*/

export interface IAdminPublicationData {
  id: string;
  type: 'admin_publication';
  attributes: {
    parent_id?: string;
    ordering: number;
  };
  relationships: {
    publication: {
      data: {
        id: string,
        type: 'project' | 'project_folder'
      };
    }
  };
}

export interface IAdminPublication {
  data: IAdminPublicationData[];
  links: ILinks;
}

interface IQueryParametersWithPS {
  publication_statuses: PublicationStatus[];
  folder?: string | null;
  areas?: string[];
  topics?: string[];
  [key: string]: any;
}

interface StreamParamsForProjects extends IStreamParams {
  queryParameters: IQueryParametersWithPS;
}

export function listAdminPublications(streamParams: StreamParamsForProjects) {
  return streams.get<IAdminPublication>({ apiEndpoint, ...streamParams });
}

export async function reorderAdminPublication(orderingId: string, newOrder: number) {
  return streams.update<IAdminPublication>(
    `${apiEndpoint}/${orderingId}/reorder`,
    orderingId,
    {
      admin_publication: {
        ordering: newOrder
      }
    }
  );
}
