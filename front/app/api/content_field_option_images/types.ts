import { ImageSizes } from 'typings';

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
