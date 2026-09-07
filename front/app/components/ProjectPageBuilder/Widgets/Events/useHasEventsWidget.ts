import { useMemo } from 'react';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

import { EVENTS_WIDGET_NAME } from 'components/admin/ContentBuilder/Widgets/Events';
import {
  findNodeIdByName,
  normalizeProjectPageLayout,
} from 'components/ProjectPageBuilder/defaultLayout';

// A project page can be laid out without an Events widget, so the events CTAs
// have to ask whether there is anything on the page to scroll to.
const useHasEventsWidget = (projectId: string) => {
  const { data: layout } = useProjectPageLayout(projectId);

  return useMemo(() => {
    const nodes = normalizeProjectPageLayout(
      layout?.data.attributes.craftjs_json
    );
    // Both names resolve to the same widget: 'EventsWidget' on existing pages, the canonical
    // name on anything added since.
    const nodeId =
      findNodeIdByName(nodes, 'EventsWidget') ??
      findNodeIdByName(nodes, EVENTS_WIDGET_NAME);

    return !!nodeId && !nodes[nodeId].hidden;
  }, [layout]);
};

export default useHasEventsWidget;
