import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IContentBuilderLayout } from 'api/content_builder/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import fetcher from 'utils/cl-react-query/fetcher';

import customPageLayoutKeys from './keys';
import { CustomPageLayoutKeys } from './types';

const fetchCustomPageLayout = (staticPageId?: string) =>
  fetcher<IContentBuilderLayout>({
    path: `/static_pages/${staticPageId}/content_builder_layouts/custom_page`,
    action: 'get',
  });

// A page with no layout returns 404. Callers treat that as "nothing stored", not an error.
const useCustomPageLayout = (staticPageId?: string) => {
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });

  return useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    CustomPageLayoutKeys
  >({
    queryKey: customPageLayoutKeys.item({ staticPageId }),
    queryFn: () => fetchCustomPageLayout(staticPageId),
    enabled: featureEnabled && !!staticPageId,
  });
};

export default useCustomPageLayout;
