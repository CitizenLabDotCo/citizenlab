import { Multiloc } from 'typings';

import { TProjectFolderCardSize } from 'components/ProjectAndFolderCards/components/ProjectFolderCard';

import { Keys } from 'utils/cl-react-query/types';

import projectFolderImagesKeys from './keys';

export type ProjectFolderImagesKeys = Keys<typeof projectFolderImagesKeys>;

export type IQueryParameters = {
  folderId: string;
};

export interface addProjectFolderImageObject {
  folderId: string;
  base64: string;
  alt_text_multiloc?: Multiloc;
}

export interface UpdateProjectFolderImageObject {
  folderId: string;
  base64: string;
  alt_text_multiloc?: Multiloc;
  imageId: string;
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
    ordering: number | null;
    created_at: string;
    updated_at: string;
    alt_text_multiloc: Multiloc;
  };
}

export interface IProjectFolderImage {
  data: IProjectFolderImageData;
}

export interface IProjectFolderImages {
  data: IProjectFolderImageData[];
}
