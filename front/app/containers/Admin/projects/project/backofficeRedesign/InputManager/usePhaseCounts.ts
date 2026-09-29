import { IIdeaQueryParameters } from 'api/ideas/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import { UNASSIGNED } from './useAssigneeOptions';

type Scope = Pick<IIdeaQueryParameters, 'projects' | 'phase' | 'transitive'>;

/**
 * Counts of the listed inputs per filter option. They ignore the active
 * filters, so an option keeps its count while the list is filtered.
 */
const usePhaseCounts = (scope: Scope) => {
  const { data: counts } = useIdeasFilterCounts(scope);
  const { data: awaiting } = useIdeasFilterCounts({
    ...scope,
    feedback_needed: true,
  });
  const { data: imported } = useIdeasFilterCounts({ ...scope, imported: true });

  if (!counts || !awaiting || !imported) return undefined;

  const { total, idea_status_id, input_topic_id, assignee_id } =
    counts.data.attributes;
  const assigned = Object.values(assignee_id).reduce((a, b) => a + b, 0);

  return {
    total,
    byStatus: idea_status_id,
    byTopic: input_topic_id,
    byAssignee: { ...assignee_id, [UNASSIGNED]: total - assigned },
    awaiting: awaiting.data.attributes.total,
    replied: total - awaiting.data.attributes.total,
    imported: imported.data.attributes.total,
    online: total - imported.data.attributes.total,
  };
};

export type PhaseCounts = NonNullable<ReturnType<typeof usePhaseCounts>>;

export default usePhaseCounts;
