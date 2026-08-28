import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { layoutHasContent } from 'components/CustomPageBuilder/defaultLayout';

// Whether a custom page should render from its layout. Shared, because the page around the
// viewer needs the same answer to decide whether to render its own sections instead.
const useCustomPageBuilderContent = (staticPageId?: string) => {
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: layout, isLoading } = useCustomPageLayout(staticPageId);

  const hasContent =
    !!layout &&
    layout.data.attributes.enabled &&
    layoutHasContent(layout.data.attributes.craftjs_json);

  return {
    // Which way to render is unknown until the query settles, so callers wait.
    isLoading: featureEnabled && isLoading,
    hasContent: featureEnabled && hasContent,
    craftjsJson: layout?.data.attributes.craftjs_json,
  };
};

export default useCustomPageBuilderContent;
