import React, { useRef } from 'react';

import { Box, Text, Spinner } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { usePdfExportContext } from './pdf/PdfExportContext';

interface Props {
  phaseId: string;
}

// Fixed dimensions for PDF export to fit A4 page (with 15mm margins)
const PDF_CHART_WIDTH = 650;
const PDF_CHART_HEIGHT = 280;

const ParticipantsTimeline = ({ phaseId }: Props) => {
  const { isPdfRenderMode } = usePdfExportContext();
  const { formatMessage } = useIntl();
  const graphRef = useRef<SVGElement>(null);

  const { data, isLoading, error } = usePhaseInsights({ phaseId });

  if (isLoading) {
    return (
      <Box mt="8px" bg="white" p="24px" borderRadius="8px">
        <Spinner size="24px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Box mt="8px" bg="white" p="24px" borderRadius="8px">
        <Text color="error">{formatMessage(messages.errorLoading)}</Text>
      </Box>
    );
  }

  const chartDataFromApi =
    data.data.attributes.participants_and_visitors_chart_data;
  const timeSeries = chartDataFromApi.timeseries;
  const resolution = chartDataFromApi.resolution;

  const chartData = timeSeries.map((row) => ({
    date: row.date_group,
    participants: row.participants,
    visitors: row.visitors,
  }));

  const xlsxData = {
    'Participation Timeline': chartData.map((row) => ({
      Date: row.date,
      Visitors: row.visitors,
      Participants: row.participants,
    })),
  };

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

      <Box
        height={isPdfRenderMode ? `${PDF_CHART_HEIGHT}px` : '249px'}
        width={isPdfRenderMode ? `${PDF_CHART_WIDTH}px` : undefined}
      >
        <Chart
          timeSeries={chartData}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={resolution}
          showVisitors={true}
          innerRef={graphRef}
          isAnimationActive={!isPdfRenderMode}
        />
      </Box>
    </Box>
  );
};

export default ParticipantsTimeline;
