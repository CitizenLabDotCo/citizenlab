import React, { useRef } from 'react';

import { Box, Text, Title, Spinner } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import DashboardCard from 'design-system/DashboardCard';
import Skeleton from 'design-system/Skeleton';

import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import ReportExportMenu from 'components/admin/ReportExportMenu';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import { usePdfExportContext } from './pdf/PdfExportContext';
import WordExportableInsight from './word/WordExportableInsight';

interface Props {
  phase: IPhaseData;
}

// Fixed dimensions for PDF export to fit A4 page (with 15mm margins)
const PDF_CHART_WIDTH = 650;
const PDF_CHART_HEIGHT = 280;

const ParticipantsTimeline = ({ phase }: Props) => {
  const { isPdfRenderMode } = usePdfExportContext();
  const redesigned = useProjectBackofficeRedesign() && !isPdfRenderMode;
  const { formatMessage } = useIntl();
  const graphRef = useRef<SVGElement>(null);

  const { data, isPending, error } = usePhaseInsights({ phaseId: phase.id });

  if (isPending && redesigned) {
    return (
      <WordExportableInsight exportId="participation-timeline" skipExport>
        <Skeleton shape="block" height={266} />
      </WordExportableInsight>
    );
  }

  if (isPending) {
    return (
      <WordExportableInsight exportId="participation-timeline" skipExport>
        <Box mt="8px" bg="white" p="24px" borderRadius="8px">
          <Spinner size="24px" />
        </Box>
      </WordExportableInsight>
    );
  }

  if (error) {
    return (
      <WordExportableInsight exportId="participation-timeline" skipExport>
        <Box mt="8px" bg="white" p="24px" borderRadius="8px">
          <Text color="error">{formatMessage(messages.errorLoading)}</Text>
        </Box>
      </WordExportableInsight>
    );
  }

  const { metrics, participants_and_visitors_chart_data: chartDataFromApi } =
    data.data.attributes;
  const timeSeries = chartDataFromApi.timeseries;
  const resolution = chartDataFromApi.resolution;
  // null when the back end could not measure participants, as opposed to
  // measuring none, which leaves the visits as the only story to tell
  const showParticipants = metrics.participants !== null;
  const title = formatMessage(
    showParticipants
      ? messages.participationOverTime
      : messages.visitorsOverTime
  );

  const chartData = timeSeries.map((row) => ({
    date: row.date_group,
    participants: row.participants,
    visitors: row.visitors,
  }));

  const xlsxData = {
    'Participation Timeline': chartData.map((row) => ({
      Date: row.date,
      Visitors: row.visitors,
      ...(showParticipants ? { Participants: row.participants } : {}),
    })),
  };

  const startAtMoment =
    timeSeries.length > 0 ? moment(timeSeries[0].date_group) : null;
  const endAtMoment =
    timeSeries.length > 0
      ? moment(timeSeries[timeSeries.length - 1].date_group)
      : null;

  const exportMenu = (
    <ReportExportMenu
      name="participation-timeline"
      svgNode={graphRef}
      xlsx={{ data: xlsxData }}
    />
  );
  const chart = (
    <WordExportableInsight
      exportId="participation-timeline"
      heading={title}
      height={isPdfRenderMode ? `${PDF_CHART_HEIGHT}px` : '249px'}
      width={isPdfRenderMode ? `${PDF_CHART_WIDTH}px` : undefined}
    >
      <Chart
        timeSeries={chartData}
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={resolution}
        showParticipants={showParticipants}
        showVisitors={true}
        innerRef={graphRef}
        isAnimationActive={!isPdfRenderMode}
      />
    </WordExportableInsight>
  );

  if (redesigned) {
    return (
      <DashboardCard title={title} actions={exportMenu}>
        {chart}
      </DashboardCard>
    );
  }

  return (
    <Box mt="8px" bg="white" py="24px" borderRadius="8px">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb="16px"
      >
        <Title variant="h3" m="0">
          {title}
        </Title>
        {exportMenu}
      </Box>
      {chart}
    </Box>
  );
};

export default ParticipantsTimeline;
