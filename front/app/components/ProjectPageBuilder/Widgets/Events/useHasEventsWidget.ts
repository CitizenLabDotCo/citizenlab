import { useMemo } from 'react';

import useProjectPageLayout from 'api/project_page_layout/useProjectPageLayout';

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
    const nodeId = findNodeIdByName(nodes, 'EventsWidget');

    return !!nodeId && !nodes[nodeId].hidden;
  }, [layout]);
};

export default useHasEventsWidget;
