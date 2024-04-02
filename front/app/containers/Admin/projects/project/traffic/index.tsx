import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';

import useLocale from 'hooks/useLocale';

import Editor from 'containers/Admin/reporting/components/ReportBuilder/Editor';
import { MAX_REPORT_WIDTH } from 'containers/Admin/reporting/constants';
import { ReportContextProvider } from 'containers/Admin/reporting/context/ReportContext';

import ContentBuilderFrame from 'components/admin/ContentBuilder/Frame';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import ProjectHeader from '../projectHeader';

const ReportPreview = () => {
  const locale = useLocale();
  const { formatMessage } = useIntl();
  const editorData = {
    ROOT: {
      type: 'div',
      nodes: ['FQjdSolK2y', 'qqJ_LZcgJ6'],
      props: {
        id: 'e2e-content-builder-frame',
      },
      custom: {},
      hidden: false,
      isCanvas: true,
      displayName: 'div',
      linkedNodes: {},
    },
    FQjdSolK2y: {
      type: {
        resolvedName: 'PhaseTemplate',
      },
      nodes: [],
      props: {
        phaseId: 'acccb9f1-dd26-4bad-858d-80c95b598d1f',
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'PhaseTemplate',
      linkedNodes: {
        'phase-report-template': 'RM3m3FX-Rz',
      },
    },
    'RM3m3FX-Rz': {
      type: {
        resolvedName: 'Box',
      },
      nodes: ['WSumAL5x9v'],
      props: {},
      custom: {},
      hidden: false,
      parent: 'FQjdSolK2y',
      isCanvas: true,
      displayName: 'Box',
      linkedNodes: {},
    },
    WSumAL5x9v: {
      type: {
        resolvedName: 'WhiteSpace',
      },
      nodes: [],
      props: {
        size: '',
      },
      custom: {
        title: {
          id: 'app.containers.AdminPage.ProjectDescription.whiteSpace',
          defaultMessage: 'White space',
        },
      },
      hidden: false,
      parent: 'RM3m3FX-Rz',
      isCanvas: false,
      displayName: 'WhiteSpace',
      linkedNodes: {},
    },
    qqJ_LZcgJ6: {
      type: {
        resolvedName: 'VisitorsWidget',
      },
      nodes: [],
      props: {
        endAt: '2024-04-02',
        title: {
          [locale]: formatMessage(messages.addNewInput),
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
      <Box bg="white">
        <ReportPreview />
      </Box>
    </div>
  );
};

export default ProjectTraffic;
