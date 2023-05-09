import { PublicationStatus } from 'services/projects';
import { Multiloc, ImageSizes, IRelationship } from 'typings';
import projectFoldersKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { IObject } from 'utils/streams';

export type ProjectFoldersKeys = Keys<typeof projectFoldersKeys>;
export interface IQueryParameters {
  pageNumber?: number;
  pageSize?: number;
  bodyData?: IObject | null;
  queryParameters?: IObject | null;
  cacheStream?: boolean;
  skipSanitizationFor?: string[];
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
    title_multiloc: Multiloc;
    description_multiloc: Multiloc;
    description_preview_multiloc: Multiloc;
    slug: string;
    header_bg?: ImageSizes;
    publication_status: PublicationStatus;
  };
  relationships: {
    projects: {
      data: { id: string; type: 'project' }[];
    };
    admin_publication: {
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
