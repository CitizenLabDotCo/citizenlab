import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

const ParticipationReportPreview = ({
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
          [locale]: formatMessage(messages.participationSources),
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

export default ParticipationReportPreview;
