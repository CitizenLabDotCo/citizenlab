import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import { useIntl } from 'utils/cl-intl';

import ProjectHeader from '../projectHeader';

import messages from './messages';

const ReportPreview = () => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
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
        projectId: '40e45b89-8351-46af-89d1-5fee6566c138',
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
          en: 'Traffic sources',
          'fr-BE': 'Sources de trafic',
          'nl-BE': 'Kanalen',
        },
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
      <Box
        w="100%"
        display="flex"
        alignItems="flex-start"
        flexDirection="column"
      >
        <Box maxWidth={MAX_REPORT_WIDTH} w="100%">
          <Editor isPreview={true}>
            {editorData && <ContentBuilderFrame editorData={editorData} />}
          </Editor>
        </Box>
      </Box>
    </ReportContextProvider>
  );
};

const ProjectTraffic = () => {
  const { projectId } = useParams() as { projectId: string };
  return (
    <div>
      <ProjectHeader projectId={projectId} />
      <Box p="32px" bg="white">
        <ReportPreview />
      </Box>
    </div>
  );
};

export default ProjectTraffic;
