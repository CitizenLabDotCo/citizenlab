import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { TProjectCardSize } from 'components/ProjectCard';

const apiEndpoint = `${API_PATH}/projects`;

type ProjectImageSizes = {
  small: string | null;
  large: string | null;
};

export const CARD_IMAGE_ASPECT_RATIO_WIDTH = 4;
export const CARD_IMAGE_ASPECT_RATIO_HEIGHT = 3;
export const CARD_IMAGE_ASPECT_RATIO =
  CARD_IMAGE_ASPECT_RATIO_WIDTH / CARD_IMAGE_ASPECT_RATIO_HEIGHT;

export const getCardImageUrl = (
  imageVersions: ProjectImageSizes,
  isPhone: boolean,
  cardSize?: TProjectCardSize
) => {
  if (isPhone || cardSize !== 'small') {
    // image size is approximately the same for both medium and large desktop card sizes
    return imageVersions.large;
  } else {
    return imageVersions.small;
  }
};

export interface IProjectImageData {
  id: string;
  type: string;
  attributes: {
    versions: ProjectImageSizes;
    ordering: string | null;
    created_at: string;
    updated_at: string;
  };
}

interface IProjectImage {
  data: IProjectImageData;
}

export interface IProjectImages {
  data: IProjectImageData[];
}

export function projectImagesStream(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IProjectImages | null>({
    apiEndpoint: `${apiEndpoint}/${projectId}/images`,
    ...streamParams,
  });
}

export function addProjectImage(projectId: string, base64: string) {
  return streams.add<IProjectImage>(`${apiEndpoint}/${projectId}/images`, {
    image: { image: base64 },
  });
}

export function deleteProjectImage(projectId: string, imageId: string) {
  return streams.delete(
    `${apiEndpoint}/${projectId}/images/${imageId}`,
    imageId
  );
}
