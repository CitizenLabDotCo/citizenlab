import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { ILinks, Multiloc, IRelationship } from 'typings';
import { PublicationStatus } from 'api/projects/types';

const apiEndpoint = `${API_PATH}/admin_publications`;

/**
 * The sole purpose of this interface is to allow widening the types
 * in external modules, by reopening the interface and adding other key-values
 */
export interface IAdminPublicationTypeMap {
  project: 'project';
  folder: 'folder';
}

export type AdminPublicationType =
  IAdminPublicationTypeMap[keyof IAdminPublicationTypeMap];

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
    depth: number;
    publication_status: PublicationStatus;
    visible_children_count: number;
    publication_title_multiloc: Multiloc;
    publication_description_multiloc: Multiloc;
    publication_description_preview_multiloc: Multiloc;
    publication_slug: string;
    publication_visible_to?: 'public' | 'groups' | 'admins' | null;
  };
  relationships: {
    children: {
      data: IRelationship[];
    };
    parent: {
      // The id in IRelationship is the parent's publication id, *not* the folder id.
      data?: IRelationship;
    };
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

interface IQueryParametersBase {
  depth?: number;
  topics?: string[];
  areas?: string[];
  publication_statuses: PublicationStatus[];
  remove_not_allowed_parents: boolean;
  folder?: string;
}

interface IStreamParamsStatusCounts extends IStreamParams {
  queryParameters: IQueryParametersBase;
}

export interface IStatusCountsBase {
  draft?: number;
  published?: number;
  archived?: number;
}

interface IStatusCountsResponse {
  data: {
    attributes: {
      status_counts: IStatusCountsBase;
    };
  };
}
export function adminPublicationsStatusCounts(
  streamParams: IStreamParamsStatusCounts
) {
  return streams.get<IStatusCountsResponse>({
    apiEndpoint: `${apiEndpoint}/status_counts`,
    ...streamParams,
  });
}
