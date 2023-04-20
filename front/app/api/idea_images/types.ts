import { Keys } from 'utils/cl-react-query/types';
import ideaImagesKeys from './keys';
import { ImageSizes } from 'typings';

export type IdeaImagesKeys = Keys<typeof ideaImagesKeys>;

export interface IIdeaImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
    ordering: number;
    created_at: string;
    updated_at: string;
  };
}

export interface IIdeaImage {
  data: IIdeaImageData;
}

export interface IIdeaImages {
  data: IIdeaImageData[];
}
