import { ImageSizes } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import initiativeImagesKeys from './keys';

export type InitiativeImagesKeys = Keys<typeof initiativeImagesKeys>;

export interface IInitiativeImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IInitiativeImage {
  data: IInitiativeImageData;
}

export interface IInitiativeImages {
  data: IInitiativeImageData[];
}

export interface AddInitiativeImageObject {
  initiativeId: string;
  image: {
    image: string;
  };
}
