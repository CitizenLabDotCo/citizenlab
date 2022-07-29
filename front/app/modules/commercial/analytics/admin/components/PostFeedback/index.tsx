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
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

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

interface Props {
  projectId?: string;
}

const PostFeedback = ({
  projectId,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const data = usePostsWithFeedback(formatMessage, projectId);
  if (!data) return null;

  const { serie, feedbackPercent, days, progressBars } = data;
  const pieCenter = {
    value: `${Math.round(feedbackPercent * 100)}%`,
    label: formatMessage(messages.feedbackGiven),
  };

  return (
    <GraphCard className="fullWidth dynamicHeight">
      <GraphCardInner>
        <GraphCardHeader>
          <GraphCardTitle>
            {formatMessage(messages.postFeedback)}
          </GraphCardTitle>
          <ReportExportMenu
            name="title"
            currentProjectFilter={undefined}
            xlsxEndpoint={undefined}
            svgNode={undefined}
          />
        </GraphCardHeader>
        <Box display="flex" justifyContent="center">
          <Box>
            <PieChart serie={serie} center={pieCenter} />
          </Box>
          <Box m="30px 0 0 50px">
            <ProgressBars data={progressBars} />
            <Text>
              <CalendarIcon name="calendar" />
              {formatMessage(messages.averageTime, { days })}
            </Text>
          </Box>
        </Box>
      </GraphCardInner>
    </GraphCard>
  );
};

export default injectIntl(PostFeedback);
