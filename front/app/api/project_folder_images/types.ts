import { TProjectFolderCardSize } from 'components/ProjectAndFolderCards/components/ProjectFolderCard';
import projectFolderImagesKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';
import { IStreamParams } from 'utils/streams';

export type ProjectFolderImagesKeys = Keys<typeof projectFolderImagesKeys>;

export type IQueryParameters = {
  folderId: string;
};

export type IGetImagesQueryParameters = {
  folderId: string;
  streamParams?: IStreamParams | null;
};

export interface addProjectFolderImageObject {
  folderId: string;
  base64: string;
}

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

export interface IProjectFolderImage {
  data: IProjectFolderImageData;
}

export interface IProjectFolderImages {
  data: IProjectFolderImageData[];
}
