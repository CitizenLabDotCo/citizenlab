import React from 'react';
import usePostsWithFeedback from './usePostsFeedback';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';

export default ({ projectId }) => {
  const data = usePostsWithFeedback(projectId);
  if (!data) return null;

  const { serie, feedbackPercent, avgTime, progressBars } = data;

  return (
    <GraphCard>
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>Posts Feedback</GraphCardTitle>
        </GraphCardHeader>
        <PieChart serie={serie} value={feedbackPercent} />
        {`Avg time: ${avgTime} days`}
        <ProgressBars data={progressBars} />
      </GraphCardInner>
    </GraphCard>
  );
};
