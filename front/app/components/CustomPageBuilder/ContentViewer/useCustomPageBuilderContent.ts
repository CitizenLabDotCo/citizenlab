import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

import {
  layoutHasContent,
  layoutStartsWithBanner,
} from 'components/CustomPageBuilder/defaultLayout';

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
    // The page anchors its edit button on this: a full-bleed banner under the nav bar puts
    // it at the window edge rather than the content's.
    startsWithBanner:
      featureEnabled &&
      layoutStartsWithBanner(layout?.data.attributes.craftjs_json),
    craftjsJson: layout?.data.attributes.craftjs_json,
    // FileAttachment resolves its file through the layout's attachments, so the viewer has
    // to put this in context or those widgets render nothing.
    layoutId: layout?.data.id,
  };
};

export default useCustomPageBuilderContent;
