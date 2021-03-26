import { Multiloc, ImageSizes, IRelationship } from 'typings';

import streams, { IStreamParams } from 'utils/streams';
import { isNilOrError } from 'utils/helperUtils';

import { API_PATH } from 'containers/App/constants';
import { PublicationStatus } from 'services/projects';
const apiEndpoint = `${API_PATH}/project_folders`;

export interface IProjectFolderDiff {
  title_multiloc: Multiloc; // Text, > 10
  description_multiloc: Multiloc; // HTML
  description_preview_multiloc: Multiloc; // Text
  header_bg?: string;
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

export interface IProjectFolder {
  data: IProjectFolderData;
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

export async function addProjectFolder(object: Partial<IProjectFolderDiff>) {
  const response = await streams.add<{ data: IProjectFolderData }>(
    apiEndpoint,
    { project_folder: object }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/admin_publications`],
  });
  return !isNilOrError(response) ? response.data : (response as Error);
}

export async function updateProjectFolder(
  projectFolderId: string,
  object: Partial<IProjectFolderDiff>,
  adminPublicationId?: string
) {
  const response = await streams.update<{ data: IProjectFolderData }>(
    `${apiEndpoint}/${projectFolderId}`,
    projectFolderId,
    { project_folder: object }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/admin_publications`],
    dataId: adminPublicationId ? [adminPublicationId] : [],
  });

  return !isNilOrError(response) ? response.data : response;
}

export async function deleteProjectFolder(projectFolderId: string) {
  const response = await streams.delete(
    `${apiEndpoint}/${projectFolderId}`,
    projectFolderId
  );

  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/admin_publications`],
  });

  return response;
}
