import { Multiloc, ImageSizes, IRelationship, Pagination } from 'typings';

import { PublicationStatus } from 'api/projects/types';

import { Keys } from 'utils/cl-react-query/types';

import projectFoldersKeys from './keys';

export type ProjectFoldersKeys = Keys<typeof projectFoldersKeys>;
export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
}
export type AdminParameters = {
  status?: PublicationStatus[];
  managers?: string[];
  search?: string;
} & Pagination;

export interface IProjectFolders {
  data: IProjectFolderData[];
}
export interface INewProjectFolderDiff {
  title_multiloc: Multiloc;
  slug: string | null;
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
  header_bg?: string | null;
  header_bg_alt_text_multiloc?: Multiloc;
  admin_publication_attributes: {
    publication_status: PublicationStatus;
  };
}

export interface IProjectFolder {
  data: IProjectFolderData;
}

export interface IProjectFolderData {
  id: string;
  type: 'folder';
  attributes: {
    avatars_count: number;
    comments_count: number;
    ideas_count: number;
    participants_count: number;
    visible_projects_count: number;
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    description_preview_multiloc: Multiloc;
    slug: string;
    header_bg?: ImageSizes;
    header_bg_alt_text_multiloc: Multiloc;
    publication_status: PublicationStatus;
    followers_count: number;
  };
  relationships: {
    admin_publication: {
      data: IRelationship | null;
    };
    avatars: {
      data: IRelationship[] | null;
    };
    images: {
      data: IRelationship[] | null;
    };
    user_follower: {
      data: IRelationship | null;
    };
  };
}

export interface IUpdatedProjectFolder {
  projectFolderId: string;
  title_multiloc?: Multiloc;
  slug?: string | null;
  description_multiloc?: Multiloc;
  description_preview_multiloc?: Multiloc;
  header_bg?: string | null;
  header_bg_alt_text_multiloc?: Multiloc;
  admin_publication_attributes?: {
    publication_status?: PublicationStatus;
  };
}
