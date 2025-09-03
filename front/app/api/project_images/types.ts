import { ImageSizes, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import ideaImagesKeys from './keys';

export type ProjectImagesKeys = Keys<typeof ideaImagesKeys>;

export interface IProjectImageData {
  id: string;
  type: 'image';
  attributes: {
    versions: ImageSizes;
    ordering: number;
    created_at: string;
    updated_at: string;
    alt_text_multiloc: Multiloc;
  };
}

export interface IProjectImage {
  data: IProjectImageData;
}

export interface IProjectImages {
  data: IProjectImageData[];
}

export interface AddProjectImageObject {
  projectId: string;
  image: { image: string; alt_text_multiloc?: Multiloc };
}

export interface UpdateProjectImageObject {
  projectId: string;
  imageId: string;
  image: { image: string; alt_text_multiloc?: Multiloc };
}
