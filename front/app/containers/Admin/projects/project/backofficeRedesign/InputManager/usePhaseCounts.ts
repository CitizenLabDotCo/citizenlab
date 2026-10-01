import { IIdeaQueryParameters } from 'api/ideas/types';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';

import { UNASSIGNED } from 'components/admin/PostManager/useAssigneeOptions';

type Scope = Pick<IIdeaQueryParameters, 'projects' | 'phase' | 'transitive'>;

const usePhaseCounts = (scope: Scope) => {
  const { data: counts } = useIdeasFilterCounts(scope);
  const { data: awaiting } = useIdeasFilterCounts({
    ...scope,
    feedback_needed: true,
  });
  const { data: replied } = useIdeasFilterCounts({
    ...scope,
    official_feedback: true,
  });
  const { data: imported } = useIdeasFilterCounts({ ...scope, imported: true });

  if (!counts || !awaiting || !replied || !imported) return undefined;

  const { total, idea_status_id, input_topic_id, assignee_id } =
    counts.data.attributes;
  const byAssignee = assignee_id && {
    ...assignee_id,
    [UNASSIGNED]: total - Object.values(assignee_id).reduce((a, b) => a + b, 0),
  };

  return {
    total,
    byStatus: idea_status_id,
    byTopic: input_topic_id,
    byAssignee,
    awaiting: awaiting.data.attributes.total,
    replied: replied.data.attributes.total,
    imported: imported.data.attributes.total,
    online: total - imported.data.attributes.total,
  };
};

export type PhaseCounts = NonNullable<ReturnType<typeof usePhaseCounts>>;

export default usePhaseCounts;
