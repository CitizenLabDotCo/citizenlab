import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryCountriesKeys from './keys';
import { ProjectLibraryCountries, ProjectLibraryCountriesKeys } from './types';

const useProjectLibraryCountries = () => {
  const locale = useLocale();

  const fetchProjectLibraryCountries = () =>
    fetcher<ProjectLibraryCountries>({
      path: `/tenant_countries`,
      action: 'get',
      apiPath: '/project_library_api',
      queryParams: { locale },
    });

  return useQuery<
    ProjectLibraryCountries,
    CLErrors,
    ProjectLibraryCountries,
    ProjectLibraryCountriesKeys
  >({
    queryKey: projectLibraryCountriesKeys.list({ locale }),
    queryFn: () => fetchProjectLibraryCountries(),
  });
};

export default useProjectLibraryCountries;
