import React from 'react';

// components
import {
  GraphCardHeader,
  GraphCardTitle,
  GraphCard,
  GraphCardInner,
} from 'components/admin/GraphWrappers';
import ReportExportMenu from 'components/admin/ReportExportMenu';
import { Box, Icon } from '@citizenlab/cl2-component-library';
import PieChart from 'components/admin/Graphs/PieChart';
import ProgressBars from 'components/admin/Graphs/ProgressBars';

// styling
import styled from 'styled-components';

// hooks
import usePostsWithFeedback from './usePostsFeedback';

// typings
import { InjectedIntlProps } from 'react-intl';

// i18n
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

const CalendarIcon = styled(Icon)`
  fill: #044d6c;
  width: 13px;
  height: 13px;
  margin-right: 11px;
`;

const Text = styled.p`
  margin: -2px 0 0 0;
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

  const { pieData, feedbackPercent, days, progressBarsData } = data;
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
            <PieChart serie={pieData} center={pieCenter} />
          </Box>
          <Box m="30px 0 0 50px">
            <ProgressBars data={progressBarsData} />
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
