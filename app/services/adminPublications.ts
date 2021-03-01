import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { ILinks, Multiloc } from 'typings';
import { PublicationStatus } from 'services/projects';

const apiEndpoint = `${API_PATH}/admin_publications`;

/**
 * The sole purpose of this interface is to allow widening the types
 * in external modules, by reopening the interface and adding other key-values
 */
export interface IAdminPublicationTypeMap {
  project: 'project';
}

export type AdminPublicationType = IAdminPublicationTypeMap[keyof IAdminPublicationTypeMap];

/**
  Data structure to handle the ordering of published projects and folders.
  Projects and folders are not included, they have to be fetched separately.
*/
export interface IAdminPublicationData {
  id: string;
  type: 'admin_publication';
  attributes: {
    parent_id?: string;
    ordering: number;
    publication_status: PublicationStatus;
    visible_children_count: number;
    publication_title_multiloc: Multiloc;
    publication_description_multiloc: Multiloc;
    publication_description_preview_multiloc: Multiloc;
    publication_slug: string;
    publication_visible_to?: 'public' | 'groups' | 'admins' | null;
  };
  relationships: {
    publication: {
      data: {
        id: string;
        type: AdminPublicationType;
      };
    };
  };
}

export interface IAdminPublications {
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

export function adminPublicationByIdStream(id: string) {
  return streams.get<{ data: IAdminPublicationData }>({
    apiEndpoint: `${apiEndpoint}/${id}`,
  });
}

export function listAdminPublications(streamParams: StreamParamsForProjects) {
  return streams.get<IAdminPublications>({ apiEndpoint, ...streamParams });
}

export async function reorderAdminPublication(
  orderingId: string,
  newOrder: number
) {
  return streams.update<IAdminPublications>(
    `${apiEndpoint}/${orderingId}/reorder`,
    orderingId,
    {
      admin_publication: {
        ordering: newOrder,
      },
    }
  );
}
