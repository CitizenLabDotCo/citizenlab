import { Keys } from 'utils/cl-react-query/types';

import projectLibraryPhasesKeys from './keys';

export type ProjectLibraryCountriesKeys = Keys<typeof projectLibraryPhasesKeys>;

export interface ProjectLibraryCountries {
  data: {
    type: 'project_library_tenant_countries';
    attributes: {
      code: string;
      name: string;
    }[];
  };
}
