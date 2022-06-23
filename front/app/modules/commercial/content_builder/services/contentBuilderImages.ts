import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';

interface IContentBuilderImage {
  data: {
    type: 'layout_image';
    id: string;
    attributes: {
      code: string;
      image_url: string;
    };
  };
}

export const addContentBuilderImage = async (base64image: string) => {
  return await streams.add<IContentBuilderImage>(
    `${API_PATH}/content_builder_layout_images`,
    { layout_image: { image: base64image } }
  );
};
