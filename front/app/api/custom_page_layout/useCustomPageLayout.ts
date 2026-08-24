import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IContentBuilderLayout } from 'api/content_builder/types';

import fetcher from 'utils/cl-react-query/fetcher';

import customPageLayoutKeys from './keys';
import { CustomPageLayoutKeys } from './types';

const fetchCustomPageLayout = (staticPageId?: string) =>
  fetcher<IContentBuilderLayout>({
    path: `/static_pages/${staticPageId}/content_builder_layouts/custom_page`,
    action: 'get',
  });

// A page with no layout yet returns 404; the builder bootstraps by upserting, so callers
// treat that as "nothing stored" rather than an error.
const useCustomPageLayout = (staticPageId?: string, enabled = true) =>
  useQuery<
    IContentBuilderLayout,
    CLErrors,
    IContentBuilderLayout,
    CustomPageLayoutKeys
  >({
    queryKey: customPageLayoutKeys.item({ staticPageId }),
    queryFn: () => fetchCustomPageLayout(staticPageId),
    enabled: enabled && !!staticPageId,
  });

export default useCustomPageLayout;
