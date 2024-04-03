import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment, { Moment } from 'moment';
import { useParams } from 'react-router-dom';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';
import DateRangePicker from 'components/admin/DateRangePicker';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import usePhases from 'api/phases/usePhases';

const TrafficReportPreview = ({
  projectId,
  startAt,
  endAt,
}: {
  projectId: string;
  startAt?: string | null;
  endAt?: string | null;
}) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();

  const editorData = {
    ROOT: {
      type: 'div',
      nodes: ['qqJ_LZcgJ6', 'A0fn6wghdA'],
      props: {
        id: 'e2e-content-builder-frame',
      },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: 'div',
      linkedNodes: {},
      parent: '',
    },

    qqJ_LZcgJ6: {
      type: {
        resolvedName: 'VisitorsWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        title: {
          [locale]: formatMessage(messages.visitorsTimeline),
        },
        projectId,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'VisitorsWidget',
      linkedNodes: {},
    },

    A0fn6wghdA: {
      type: {
        resolvedName: 'VisitorsTrafficSourcesWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        title: {
          [locale]: formatMessage(messages.trafficSources),
        },
        projectId,
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'VisitorsTrafficSourcesWidget',
      linkedNodes: {},
    },
  };

  return (
    <ReportContextProvider width="desktop">
      <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
        <Editor isPreview={true}>
          {editorData && <ContentBuilderFrame editorData={editorData} />}
        </Editor>
      </Box>
    </ReportContextProvider>
  );
};

const ProjectTraffic = ({
  defaultStartDate,
  defaultEndDate,
}: {
  defaultStartDate: string | null;
  defaultEndDate: string | null;
}) => {
  const { projectId } = useParams() as { projectId: string };

  const { formatMessage } = useIntl();

  const [startAt, setStartAt] = useState<string | null>(defaultStartDate);
  const [endAt, setEndAt] = useState<string | null>(defaultEndDate);

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setStartAt(startDate?.format('YYYY-MM-DD') || null);
    setEndAt(endDate?.format('YYYY-MM-DD') || null);
  };

  return (
    <div>
      <Box px="32px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <DateRangePicker
          startDate={startAt ? moment(startAt) : null}
          endDate={endAt ? moment(endAt) : null}
          onDatesChange={handleChangeTimeRange}
        />
      </Box>
      <Box p="32px" bg="white">
        <TrafficReportPreview
          projectId={projectId}
          startAt={startAt}
          endAt={endAt}
        />
      </Box>
    </div>
  );
};

const ProjectTrafficWithDefaultDates = () => {
  const { projectId } = useParams() as { projectId: string };
  const { data: phases } = usePhases(projectId);

  const startOfFirstPhase = phases?.data[0]?.attributes.start_at;
  const endOfLastPhase =
    phases?.data[phases.data.length - 1]?.attributes.end_at;

  if (!phases) return null;
  return (
    <ProjectTraffic
      defaultStartDate={startOfFirstPhase || null}
      defaultEndDate={endOfLastPhase || null}
    />
  );
};

export default ProjectTrafficWithDefaultDates;
