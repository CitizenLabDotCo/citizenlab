import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPage, CustomPagesKeys } from './types';

const fetchCustomPage = ({ slug }: { slug: string }) =>
  fetcher<ICustomPage>({
    path: `/static_pages/by_slug/${slug}`,
    action: 'get',
  });

const useCustomPageBySlug = (slug: string) => {
  return useQuery<ICustomPage, CLErrors, ICustomPage, CustomPagesKeys>({
    queryKey: customPagesKeys.item({ slug }),
    queryFn: () => fetchCustomPage({ slug }),
  });
};

export default useCustomPageBySlug;
