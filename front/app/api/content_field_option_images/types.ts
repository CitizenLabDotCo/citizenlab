export interface ICustomFieldOptionImage {
  data: {
    type: 'image';
    id: string;
    attributes: {
      code: string;
      image_url: string;
    };
  };
}
