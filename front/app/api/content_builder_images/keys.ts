import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'content_builder_images' };

const contentBuilderImagesKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default contentBuilderImagesKeys;
