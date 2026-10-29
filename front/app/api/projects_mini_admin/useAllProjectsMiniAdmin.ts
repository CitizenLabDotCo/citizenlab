import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import useLocale from 'hooks/useLocale';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsMiniAdminKeys from './keys';
import { Parameters, ProjectsMiniAdmin, ProjectsMiniAdminKeys } from './types';

const PAGE_SIZE = 250;

// Loads every page into one response. A failed page fails the whole query,
// rather than leaving a partial list behind.
const fetchAllProjectsMiniAdmin = async (
  params: Parameters
): Promise<ProjectsMiniAdmin> => {
  const data: ProjectsMiniAdmin['data'] = [];
  const included: NonNullable<ProjectsMiniAdmin['included']> = [];
  let pageNumber = 1;
  let page: ProjectsMiniAdmin;

  do {
    page = await fetcher<ProjectsMiniAdmin>({
      path: '/projects/for_admin',
      action: 'get',
      queryParams: {
        ...params,
        'page[number]': pageNumber,
        'page[size]': PAGE_SIZE,
      },
    });
    data.push(...page.data);
    included.push(...(page.included ?? []));
    pageNumber += 1;
  } while (page.links.next);

  return { data, included, links: page.links };
};

const useAllProjectsMiniAdmin = (
  params: Omit<Parameters, 'page[number]' | 'page[size]' | 'locale'>
) => {
  const locale = useLocale();
  const paramsWithLocale = { ...params, locale };

  return useQuery<
    ProjectsMiniAdmin,
    CLErrors,
    ProjectsMiniAdmin,
    ProjectsMiniAdminKeys
  >({
    queryKey: projectsMiniAdminKeys.list(paramsWithLocale),
    queryFn: () => fetchAllProjectsMiniAdmin(paramsWithLocale),
  });
};

export default useAllProjectsMiniAdmin;
