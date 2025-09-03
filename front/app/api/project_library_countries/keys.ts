import { QueryKeys } from 'utils/cl-react-query/types';

import { ILocaleParameters } from './types';

const baseKey = { type: 'project_library_tenant_countries' };

const projectLibraryCountriesKeys = {
  all: () => [baseKey],
  lists: () => [{ ...baseKey, operation: 'list' }],
  list: (params: ILocaleParameters = {}) => [
    { ...baseKey, operation: 'list', parameters: params },
  ],
} satisfies QueryKeys;

export default projectLibraryCountriesKeys;
