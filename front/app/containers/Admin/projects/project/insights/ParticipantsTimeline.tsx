import React, { useRef } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import { useQuery } from '@tanstack/react-query';
import moment from 'moment';

import { ParticipantsResponse } from 'api/graph_data_units/responseTypes/ParticipantsWidget';
import useGraphDataUnitsLive from 'api/graph_data_units/useGraphDataUnitsLive';
import {
  getDummyParticipants,
  USE_DUMMY_METHOD_SPECIFIC_DATA,
} from 'api/phase_insights/dummyData';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  phaseId: string;
}

/**
 * ParticipantsTimeline component for Phase Insights
 *
 * Uses the enhanced ParticipantsWidget API with dummy data support.
 * Shows both visitors and participants over time to visualize the
 * participation funnel (visitor → participant conversion).
 *
 * When USE_DUMMY_METHOD_SPECIFIC_DATA is false, this will use real API data.
 */
const ParticipantsTimeline = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const dummyDataQuery = useQuery<ParticipantsResponse>({
    queryKey: ['graph_data_units', 'ParticipantsWidget', 'dummy', phaseId],
    queryFn: () => Promise.resolve(getDummyParticipants()),
    enabled: USE_DUMMY_METHOD_SPECIFIC_DATA,
  });

  const realDataQuery = useGraphDataUnitsLive<ParticipantsResponse>(
    {
      resolved_name: 'ParticipantsWidget',
      props: {
        phase_id: phaseId,
        resolution: 'month',
        show_visitors: true,
      },
    },
    { enabled: !USE_DUMMY_METHOD_SPECIFIC_DATA }
  );

  const { data, isLoading } = USE_DUMMY_METHOD_SPECIFIC_DATA
    ? dummyDataQuery
    : realDataQuery;

  if (isLoading) {
    return (
      <Box mt="8px" bg="white" p="24px" borderRadius="8px">
        <Text>{formatMessage(messages.loading)}</Text>
      </Box>
    );
  }

  const timeSeries = data?.data.attributes.participants_timeseries || [];

  const chartData = timeSeries.map((row) => ({
    date: row.date_group,
    participants: row.participants,
    visitors: row.visitors || 0,
  }));

  const xlsxData = {
    'Participation Timeline': chartData.map((row) => ({
      Date: row.date,
      Visitors: row.visitors,
      Participants: row.participants,
    })),
  };

  // Get date range from timeseries
  const startAtMoment =
    timeSeries.length > 0 ? moment(timeSeries[0].date_group) : null;
  const endAtMoment =
    timeSeries.length > 0
      ? moment(timeSeries[timeSeries.length - 1].date_group)
      : null;

  return (
    <Box mt="8px" bg="white" py="24px" borderRadius="8px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="16px"
      >
        <Text fontSize="l" fontWeight="semi-bold" my="0px">
          {formatMessage(messages.participationOverTime)}
        </Text>
        <ReportExportMenu
          name="participation-timeline"
          svgNode={graphRef}
          xlsx={{ data: xlsxData }}
        />
      </Box>

      <Box height="249px">
        <Chart
          timeSeries={chartData}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution="month"
          showVisitors={true}
          innerRef={graphRef}
        />
      </Box>
    </Box>
  );
};

export default ParticipantsTimeline;
