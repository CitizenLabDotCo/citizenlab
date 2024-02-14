import { Keys } from 'utils/cl-react-query/types';
import { ImageSizes } from 'typings';
import customFieldOptionKeys from './keys';

export type CustomFieldOptionKeys = Keys<typeof customFieldOptionKeys>;

export interface ICustomFieldOptionImage {
  data: {
    type: 'image';
    id: string;
    attributes: {
      versions: ImageSizes;
      created_at: string;
      updated_at: string;
      oredering: number;
    };
  };
}
