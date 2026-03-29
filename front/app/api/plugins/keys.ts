import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'plugin_front_entry',
};

const pluginKeys = {
  all: () => [baseKey],
  items: () => [{ ...baseKey, operation: 'item' }],
} satisfies QueryKeys;

export default pluginKeys;
