import { useEffect, useRef } from 'react';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useUpsertCustomPageLayout from 'api/custom_page_layout/useUpsertCustomPageLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

// A page with no layout 404s; create one, derived from the page's own content, so the builder
// and anything showing the page render that content.
const useEnsureCustomPageLayout = (customPageId: string) => {
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { isError } = useCustomPageLayout(customPageId);
  const { mutate: upsertCustomPageLayout } = useUpsertCustomPageLayout();

  const bootstrappedPageId = useRef<string>();
  useEffect(() => {
    if (!featureEnabled) return;
    if (isError && bootstrappedPageId.current !== customPageId) {
      bootstrappedPageId.current = customPageId;
      upsertCustomPageLayout({ staticPageId: customPageId });
    }
  }, [featureEnabled, isError, customPageId, upsertCustomPageLayout]);
};

export default useEnsureCustomPageLayout;
