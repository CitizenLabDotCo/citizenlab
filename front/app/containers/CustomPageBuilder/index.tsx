import React, { useEffect, useRef } from 'react';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';
import useUpsertCustomPageLayout from 'api/custom_page_layout/useUpsertCustomPageLayout';
import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useParams } from 'utils/router';

import CustomPageBuilderPage from './CustomPageBuilderPage';

const CustomPageBuilder = () => {
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  // The page is gated, not just the link to it: opening the builder provisions a layout, so
  // a typed URL on a tenant without the feature would write data.
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: customPage } = useCustomPageById(customPageId);
  const { isError } = useCustomPageLayout(customPageId);
  const { mutate: upsertCustomPageLayout } = useUpsertCustomPageLayout();

  // A page with no layout 404s; create one so the builder opens on the page's own content.
  const bootstrappedPageId = useRef<string>();
  useEffect(() => {
    if (!featureEnabled) return;
    if (isError && bootstrappedPageId.current !== customPageId) {
      bootstrappedPageId.current = customPageId;
      upsertCustomPageLayout({ staticPageId: customPageId, enabled: true });
    }
  }, [featureEnabled, isError, customPageId, upsertCustomPageLayout]);

  if (!featureEnabled || !customPage) return null;

  const backPath = `/admin/pages-menu/pages/${customPageId}/content${window.location.search}`;

  return (
    <CustomPageBuilderPage
      staticPageId={customPageId}
      backPath={backPath}
      previewLink={{
        to: '/pages/$slug',
        params: { slug: customPage.data.attributes.slug },
      }}
      titleMultiloc={customPage.data.attributes.title_multiloc}
    />
  );
};

export default CustomPageBuilder;
