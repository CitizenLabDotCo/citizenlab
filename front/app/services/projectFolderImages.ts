import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { TProjectFolderCardSize } from 'components/ProjectAndFolderCards/components/ProjectFolderCard';

const apiEndpoint = `${API_PATH}/project_folders`;

export const CARD_IMAGE_ASPECT_RATIO_WIDTH = 4;
export const CARD_IMAGE_ASPECT_RATIO_HEIGHT = 3;
export const CARD_IMAGE_ASPECT_RATIO =
  CARD_IMAGE_ASPECT_RATIO_WIDTH / CARD_IMAGE_ASPECT_RATIO_HEIGHT;

export type ProjectFolderImageSizes = {
  small: string | null;
  large: string | null;
};

export const getCardImageUrl = (
  imageVersions: ProjectFolderImageSizes,
  isPhone: boolean,
  cardSize?: TProjectFolderCardSize
) => {
  if (isPhone || cardSize !== 'small') {
    // image size is approximately the same for both medium and large desktop card sizes
    return imageVersions.large;
  } else {
    return imageVersions.small;
  }
};

export interface IProjectFolderImageData {
  id: string;
  type: string;
  attributes: {
    versions: ProjectFolderImageSizes;
    ordering: string | null;
    created_at: string;
    updated_at: string;
  };
}

interface IProjectFolderImage {
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
