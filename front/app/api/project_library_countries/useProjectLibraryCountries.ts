import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryCountriesKeys from './keys';
import { ProjectLibraryCountries, ProjectLibraryCountriesKeys } from './types';

const fetchProjectLibraryCountries = () =>
  fetcher<ProjectLibraryCountries>({
    path: `/tenant_countries`,
    action: 'get',
    apiPath: '/project_library_api',
  });

const useProjectLibraryCountries = () => {
  return useQuery<
    ProjectLibraryCountries,
    CLErrors,
    ProjectLibraryCountries,
    ProjectLibraryCountriesKeys
  >({
    queryKey: projectLibraryCountriesKeys.all(),
    queryFn: () => fetchProjectLibraryCountries(),
  });
};

export default useProjectLibraryCountries;
