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

import ProjectHeader from '../projectHeader';

import messages from './messages';

const TrafficReportPreview = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
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
        endAt: '2024-04-02',
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
        endAt: '2024-04-02',
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

const ProjectTraffic = () => {
  const { formatMessage } = useIntl();
  const { projectId } = useParams() as { projectId: string };
  const [startAt, setStartAt] = useState<Moment | null>(null);
  const [endAt, setEndAt] = useState<Moment | null>(null);

  const handleChangeTimeRange = ({
    startDate,
    endDate,
  }: {
    startDate: Moment | null;
    endDate: Moment | null;
  }) => {
    setStartAt(moment(startDate?.format('YYYY-MM-DDTHH:mm:ss.sss')) || null);
    setEndAt(moment(endDate?.format('YYYY-MM-DDTHH:mm:ss.sss')) || null);
  };

  return (
    <div>
      <ProjectHeader projectId={projectId} />
      <Box px="32px" mb="20px">
        <Text variant="bodyM" color="textSecondary" mb="5px">
          {formatMessage(messages.selectPeriod)}
        </Text>
        <DateRangePicker
          startDate={startAt}
          endDate={endAt}
          onDatesChange={handleChangeTimeRange}
        />
      </Box>
      <Box p="32px" bg="white">
        <TrafficReportPreview />
      </Box>
    </div>
  );
};

export default ProjectTraffic;
