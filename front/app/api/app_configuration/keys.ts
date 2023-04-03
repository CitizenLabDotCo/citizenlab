import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = {
  type: 'app_configuration',
};

const appConfigurationKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default appConfigurationKeys;
