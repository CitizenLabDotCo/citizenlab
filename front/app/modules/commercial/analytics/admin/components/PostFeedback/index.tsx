import React from 'react';
import usePostsWithFeedback from './usePostsFeedback';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import PieChart from 'components/admin/Graphs/PieChart';

const labelColors = {
  sum_feedback_none: '#5D99C6 ',
  sum_feedback_official: '#C37281 ',
  sum_feedback_status_change: '#B0CDC4 ',
  avg_feedback_time_taken: '#C0C2CE',
};

export default ({ projectId }) => {
  const res = usePostsWithFeedback(projectId);
  if (!res || res.data.length === 0) return null;

  const serie = Object.entries(res.data[0])
    .filter(([_, v]) => !isNaN(Number(v)))
    .map(([k, v]) => ({ code: k, name: k, value: v }));

  return (
    <GraphCard>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            How many posts have received feedback?
          </GraphCardTitle>
        </GraphCardHeader>
        {serie && <PieChart serie={serie} labelColors={labelColors} />}
      </GraphCardInner>
    </GraphCard>
  );
};
