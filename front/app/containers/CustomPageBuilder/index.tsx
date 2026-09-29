import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';

import useFeatureFlag from 'hooks/useFeatureFlag';

import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

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
  useEnsureCustomPageLayout(customPageId);

  if (!featureEnabled || !customPage) return null;

  const backPath = `/admin/pages-menu/pages/${customPageId}/settings${window.location.search}`;

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
