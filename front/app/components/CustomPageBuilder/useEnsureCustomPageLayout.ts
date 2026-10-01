import { useEffect, useRef } from 'react';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useUpsertCustomPageLayout from 'api/custom_page_layout/useUpsertCustomPageLayout';
import useCustomPageById from 'api/custom_pages/useCustomPageById';
import { isOnContentBuilder } from 'api/custom_pages/util';

import useFeatureFlag from 'hooks/useFeatureFlag';

// A page with no layout 404s; create one, derived from the page's own content, so the builder
// and anything showing the page render that content. Only for pages on the builder: anything
// else never shows a layout, so one written for it would be invisible.
const useEnsureCustomPageLayout = (customPageId: string) => {
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: customPage } = useCustomPageById(customPageId);
  const onContentBuilder = !!customPage && isOnContentBuilder(customPage.data);
  const { isError } = useCustomPageLayout(customPageId);
  const { mutate: upsertCustomPageLayout } = useUpsertCustomPageLayout();

  const bootstrappedPageId = useRef<string>();
  useEffect(() => {
    if (!featureEnabled || !onContentBuilder) return;
    if (isError && bootstrappedPageId.current !== customPageId) {
      bootstrappedPageId.current = customPageId;
      upsertCustomPageLayout({ staticPageId: customPageId });
    }
  }, [
    featureEnabled,
    onContentBuilder,
    isError,
    customPageId,
    upsertCustomPageLayout,
  ]);
};

export default useEnsureCustomPageLayout;
