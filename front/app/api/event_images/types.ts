import { ImageSizes, Multiloc } from 'typings';

import { Keys } from 'utils/cl-react-query/types';

import eventImagesKeys from './keys';

export type EventImagesKeys = Keys<typeof eventImagesKeys>;

export interface IEventImageData {
  id: string;
  type: string;
  attributes: {
    versions: ImageSizes;
    ordering: number;
    created_at: string;
    updated_at: string;
    alt_text_multiloc: Multiloc;
  };
}

export interface IEventImage {
  data: IEventImageData;
}

interface ImageProps {
  image: string;
  alt_text_multiloc?: Multiloc;
}

export interface AddEventImageObject {
  eventId: string;
  image: ImageProps;
}

export interface UpdateEventImageObject {
  eventId: string;
  imageId: string;
  image: ImageProps;
}
