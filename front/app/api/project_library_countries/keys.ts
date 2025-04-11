import { QueryKeys } from 'utils/cl-react-query/types';

const projectLibraryCountriesKeys = {
  all: (locale?: string) => [
    {
      type: 'project_library_tenant_countries',
      locale,
    },
  ],
} satisfies QueryKeys;

export default projectLibraryCountriesKeys;
