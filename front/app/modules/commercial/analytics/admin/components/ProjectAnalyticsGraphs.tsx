import React from 'react';
import usePostsWithFeedback from '../../hooks/usePostsWithFeedback';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
  PieChartStyleFixesDiv,
} from 'components/admin/GraphWrappers';
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer } from 'recharts';

const labelColors = {
  sum_feedback_none: '#5D99C6 ',
  sum_feedback_official: '#C37281 ',
  sum_feedback_status_change: '#B0CDC4 ',
  avg_feedback_time_taken: '#C0C2CE',
};

export default ({ projectId }) => {
  const res = usePostsWithFeedback(projectId);
  if (!res) return null;

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
        {serie && (
          <PieChartStyleFixesDiv>
            <ResponsiveContainer height={175} width="100%" minWidth={175}>
              <PieChart>
                <Pie
                  isAnimationActive={true}
                  data={serie}
                  dataKey="value"
                  outerRadius={60}
                >
                  {serie.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={labelColors[entry.code]}
                    />
                  ))}
                </Pie>
                <Tooltip isAnimationActive={false} />
              </PieChart>
            </ResponsiveContainer>
          </PieChartStyleFixesDiv>
        )}
      </GraphCardInner>
    </GraphCard>
  );
};
