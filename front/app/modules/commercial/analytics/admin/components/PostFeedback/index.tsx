import React from 'react';
import usePostsWithFeedback from './usePostsFeedback';
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import PieChart from 'components/admin/Graphs/PieChart';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import ProgressBars from 'components/admin/Graphs/ProgressBars';
import styled from 'styled-components';
import ReportExportMenu from 'components/admin/ReportExportMenu';

const CalendarIcon = styled(Icon)`
  fill: #044d6c;
  width: 13px;
  height: 13px;
  margin-right: 11px;
`;

const Text = styled.p`
  margin: -2px 0 0 0;
  display: block;
  color: #044d6c;
  font-size: 14px;
  display: block !important;
`;

export default ({ projectId }) => {
  const data = usePostsWithFeedback(projectId);
  if (!data) return null;

  const { serie, feedbackPercent, avgTime, progressBars } = data;

  return (
    <GraphCard className="fullWidth dynamicHeight">
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>Post feedback</GraphCardTitle>
          <ReportExportMenu
            name="title"
            currentProjectFilter={undefined}
            xlsxEndpoint={undefined}
            svgNode={undefined}
          />
        </GraphCardHeader>
        <Box display="flex" justifyContent="center">
          <Box>
            <PieChart serie={serie} value={feedbackPercent} />
          </Box>
          <Box m="30px 0 0 50px">
            <ProgressBars data={progressBars} />
            <Text>
              <CalendarIcon name="calendar" />
              {`Avg. response time: ${avgTime} days`}
            </Text>
          </Box>
        </Box>
      </GraphCardInner>
    </GraphCard>
  );
};
