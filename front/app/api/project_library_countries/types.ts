import { Keys } from 'utils/cl-react-query/types';

import projectLibraryPhasesKeys from './keys';

export type ProjectLibraryCountriesKeys = Keys<typeof projectLibraryPhasesKeys>;

export interface ILocaleParameters {
  locale?: string;
}

export type Country = {
  code: string;
  emoji_flag: string;
  name: string;
};

export interface ProjectLibraryCountries {
  data: {
    type: 'project_library_tenant_countries';
    attributes: Country[];
  };
}
