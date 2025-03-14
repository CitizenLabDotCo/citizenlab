import { QueryKeys } from 'utils/cl-react-query/types';

const baseKey = { type: 'project_library_tenant_countries' };

const projectLibraryCountriesKeys = {
  all: () => [baseKey],
} satisfies QueryKeys;

export default projectLibraryCountriesKeys;
