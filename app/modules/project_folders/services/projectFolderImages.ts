import { ImageSizes } from 'typings';
import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';

const apiEndpoint = `${API_PATH}/project_folders`;

export interface IProjectFolderImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
    ordering: string | null;
    created_at: string;
    updated_at: string;
  };
}

export interface IProjectFolderImage {
  data: IProjectFolderImageData;
}

export interface IProjectFolderImages {
  data: IProjectFolderImageData[];
}

export function projectFolderImagesStream(
  projectFolderId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectFolderImages | null>({
    apiEndpoint: `${apiEndpoint}/${projectFolderId}/images`,
    ...streamParams,
  });
}

export function projectFolderImageStream(
  projectFolderId: string,
  imageId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectFolderImage>({
    apiEndpoint: `${apiEndpoint}/${projectFolderId}/images/${imageId}`,
    ...streamParams,
  });
}

export function addProjectFolderImage(projectFolderId: string, base64: string) {
  return streams.add<IProjectFolderImage>(
    `${apiEndpoint}/${projectFolderId}/images`,
    { image: { image: base64 } }
  );
}

export function deleteProjectFolderImage(
  projectFolderId: string,
  imageId: string
) {
  return streams.delete(
    `${apiEndpoint}/${projectFolderId}/images/${imageId}`,
    imageId
  );
}
