import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import homepageBuilderKeys from './keys';
import { IHomepageBuilderLayout, HomepageBuilderKeys } from './types';

export const fetchHomepageBuilderLayout = () => {
  return fetcher<IHomepageBuilderLayout>({
    path: `/home_pages/content_builder_layouts/homepage`,
    action: 'get',
  });
};

const useHomepageLayout = () => {
  return useQuery<
    IHomepageBuilderLayout,
    CLErrors,
    IHomepageBuilderLayout,
    HomepageBuilderKeys
  >({
    queryKey: homepageBuilderKeys.items(),
    queryFn: () => fetchHomepageBuilderLayout(),
  });
};

export default useHomepageLayout;
