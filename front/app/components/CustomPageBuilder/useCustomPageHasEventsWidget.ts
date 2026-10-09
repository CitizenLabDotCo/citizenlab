import { useMemo } from 'react';

import useCustomPageBySlug from 'api/custom_pages/useCustomPageBySlug';

import { getResolvedName } from 'components/admin/ContentBuilder/resolvedName';
import { EVENTS_WIDGET_NAME } from 'components/admin/ContentBuilder/Widgets/Events';
import useCustomPageBuilderContent from 'components/CustomPageBuilder/ContentViewer/useCustomPageBuilderContent';

// Whether a project's static page lists that project's events itself, so the Participation box's
// events button can scroll there instead of going to the project page. Only a widget about its
// own project carries the anchor it scrolls to.
const useCustomPageHasEventsWidget = (pageSlug?: string) => {
  const { data: page } = useCustomPageBySlug(pageSlug);
  const { hasContent, craftjsJson } = useCustomPageBuilderContent(
    page?.data.id
  );

  return useMemo(
    () =>
      hasContent &&
      !!craftjsJson &&
      Object.values(craftjsJson).some(
        (node) =>
          getResolvedName(node) === EVENTS_WIDGET_NAME &&
          node.props.source === 'currentProject' &&
          !node.hidden
      ),
    [hasContent, craftjsJson]
  );
};

export default useCustomPageHasEventsWidget;
