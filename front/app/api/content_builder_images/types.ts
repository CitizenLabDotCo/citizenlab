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
