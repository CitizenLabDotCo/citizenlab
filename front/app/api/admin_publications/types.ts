import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';
import adminPublicationsKeys from './keys';
import { ILinks, IRelationship, Multiloc } from 'typings';

export type AdminPublicationsKeys = Keys<typeof adminPublicationsKeys>;

export interface IQueryParameters {
  topicIds?: string[] | null;
  areaIds?: string[] | null;
  publicationStatusFilter?: PublicationStatus[];
  childrenOfId?: string;
  search?: string | null;
  pageNumber?: number;
  pageSize?: number;
  rootLevelOnly?: boolean;
  removeNotAllowedParents?: boolean;
  onlyProjects?: boolean;
}

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
    followers_count: number;
  };
  relationships: {
    children: {
      data: IRelationship[];
    };
    parent: {
      // The id in IRelationship is the parent's publication id, *not* the folder id.
      data?: IRelationship | null;
    };
    publication: {
      data: {
        id: string;
        type: AdminPublicationType;
      };
    };
    user_follower: {
      data: IRelationship | null;
    };
  };
}

export interface IAdminPublications {
  data: IAdminPublicationData[];
  links: ILinks;
}

export interface IAdminPublication {
  data: IAdminPublicationData;
}
