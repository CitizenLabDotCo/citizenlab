import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'home_page',
};

const homepageSettingsKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default homepageSettingsKeys;
