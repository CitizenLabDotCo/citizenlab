import React from 'react';

import useCustomPageById from 'api/custom_pages/useCustomPageById';
import { isOnContentBuilder } from 'api/custom_pages/util';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { adminCustomPageSettingsPath } from 'containers/Admin/pagesAndMenu/routes';

import useEnsureCustomPageLayout from 'components/CustomPageBuilder/useEnsureCustomPageLayout';

import { useLocation, useParams } from 'utils/router';

import CustomPageBuilderPage from './CustomPageBuilderPage';

const CustomPageBuilder = () => {
  const { customPageId } = useParams({ strict: false }) as {
    customPageId: string;
  };
  // The page is gated, not just the link to it: opening the builder provisions a layout, so
  // a typed URL on a tenant without the feature, or for a page not on the builder, would write
  // data.
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: customPage } = useCustomPageById(customPageId);
  useEnsureCustomPageLayout(customPageId);
  const { searchStr } = useLocation();

  if (!featureEnabled || !customPage || !isOnContentBuilder(customPage.data)) {
    return null;
  }

  const backPath = `${adminCustomPageSettingsPath(customPageId)}${searchStr}`;

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
