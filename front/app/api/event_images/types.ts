import { ImageSizes } from 'typings';

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
  };
}

export interface IEventImage {
  data: IEventImageData;
}

export interface AddEventImageObject {
  eventId: string;
  image: { image: string };
}
