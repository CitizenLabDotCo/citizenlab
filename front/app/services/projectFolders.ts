import { Multiloc, ImageSizes, IRelationship } from 'typings';
import streams, { IStreamParams } from 'utils/streams';
import { API_PATH } from 'containers/App/constants';
import { PublicationStatus } from 'services/projects';

const apiEndpoint = `${API_PATH}/project_folders`;

export interface IProjectFolderDiff {
  title_multiloc: Multiloc; // Text, > 10
  slug: string | null;
  description_multiloc: Multiloc; // HTML
  description_preview_multiloc: Multiloc; // Text
  header_bg?: string | null;
  admin_publication_attributes: {
    publication_status: PublicationStatus;
  };
}

export interface IProjectFolderData {
  id: string;
  type: 'folder';
  attributes: {
    title_multiloc: Multiloc; // Text, > 10
    description_multiloc: Multiloc; // HTML
    description_preview_multiloc: Multiloc; // Text
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

export function projectFoldersStream(
  streamParams: IStreamParams | null = null
) {
  return streams.get<{ data: IProjectFolderData[] }>({
    apiEndpoint,
    ...streamParams,
  });
}

export function projectFolderByIdStream(projectFolderId: string) {
  return streams.get<{ data: IProjectFolderData }>({
    apiEndpoint: `${apiEndpoint}/${projectFolderId}`,
  });
}

export function projectFolderBySlugStream(projectFolderSlug: string) {
  return streams.get<{ data: IProjectFolderData }>({
    apiEndpoint: `${apiEndpoint}/by_slug/${projectFolderSlug}`,
  });
}
