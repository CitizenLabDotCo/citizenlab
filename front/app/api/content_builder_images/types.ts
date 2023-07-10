import { Keys } from 'utils/cl-react-query/types';
import contentBuilderImagesKeys from './keys';

export type ContentBuilderImagesKeys = Keys<typeof contentBuilderImagesKeys>;

export interface IContentBuilderImage {
  data: {
    type: 'layout_image';
    id: string;
    attributes: {
      code: string;
      image_url: string;
    };
  };
}

export interface IAddContentBuilderImage {
  base64: string;
}
