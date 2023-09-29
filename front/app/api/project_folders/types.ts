import { PublicationStatus } from 'api/projects/types';
import { Multiloc, ImageSizes, IRelationship } from 'typings';
import projectFoldersKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

export type ProjectFoldersKeys = Keys<typeof projectFoldersKeys>;
export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
}
export interface IProjectFolders {
  data: IProjectFolderData[];
}
export interface INewProjectFolderDiff {
  title_multiloc: Multiloc;
  slug: string | null;
  description_multiloc: Multiloc;
  description_preview_multiloc: Multiloc;
  header_bg?: string | null;
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
    publication_status: PublicationStatus;
    followers_count: number;
  };
  relationships: {
    projects: {
      data: { id: string; type: 'project' }[];
    };
    admin_publication: {
      data: IRelationship | null;
    };
    avatars: {
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
  admin_publication_attributes?: {
    publication_status?: PublicationStatus;
  };
}
