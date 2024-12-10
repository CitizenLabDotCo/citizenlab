import { ILinks, IRelationship, Multiloc } from 'typings';

import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import adminPublicationsKeys from './keys';

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
  review_state?: 'pending' | 'approved';
  filter_is_moderator_of?: boolean;
  filter_user_is_moderator_of?: string;
  include_publications?: boolean;
}

export type AdminPublicationType = 'project' | 'folder';

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
