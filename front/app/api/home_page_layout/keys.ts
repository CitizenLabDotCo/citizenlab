import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'content_builder_layout' };

const homepageBuilderKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
  item: (parameters: { variant: 'homepage' }) => [
    { ...baseKey, operation: 'item', parameters },
  ],
} satisfies QueryKeys;

export default homepageBuilderKeys;
