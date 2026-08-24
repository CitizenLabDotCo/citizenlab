import { isEmpty } from 'lodash-es';

import useCustomPageLayout from 'api/custom_page_layout/useCustomPageLayout';

import useFeatureFlag from 'hooks/useFeatureFlag';

/**
 * Whether a custom page should render from its Content Builder layout.
 *
 * Both the viewer and the page around it need this: the page has to know whether to render
 * its legacy sections instead, so the decision cannot live inside the viewer alone.
 */
const useCustomPageBuilderContent = (staticPageId?: string) => {
  const featureEnabled = useFeatureFlag({ name: 'custom_page_builder' });
  const { data: layout, isLoading } = useCustomPageLayout(
    staticPageId,
    featureEnabled
  );

  const hasContent =
    !!layout &&
    layout.data.attributes.enabled &&
    !isEmpty(layout.data.attributes.craftjs_json);

  return {
    // While the query is in flight we cannot tell which way to render, so callers wait.
    isLoading: featureEnabled && isLoading,
    hasContent: featureEnabled && hasContent,
    craftjsJson: layout?.data.attributes.craftjs_json,
  };
};

export default useCustomPageBuilderContent;
