import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

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
  const { data: phases } = usePhases(projectId);
  const { formatMessage } = useIntl();
  const locale = useLocale();

  // Only show ideation charts if there is at least one ideation phase
  const ideationChartIds = phases?.data.some(
    (phase) => phase.attributes.participation_method === 'ideation'
  )
    ? ['sE49Spf_DM', 'glFgBKdUAs', 'GsowM7Fnye']
    : [];

  const editorData = {
    ROOT: {
      type: 'div',
      nodes: ['-3htyFT8is', 'Xk1CtBYcqL', ...ideationChartIds],
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
    '-3htyFT8is': {
      type: {
        resolvedName: 'ActiveUsersWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: { [locale]: formatMessage(messages.participantsTimeline) },
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'ActiveUsersWidget',
      linkedNodes: {},
    },
    GsowM7Fnye: {
      type: {
        resolvedName: 'ReactionsByTimeWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: { [locale]: formatMessage(messages.reactions) },
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'ReactionsByTimeWidget',
      linkedNodes: {},
    },
    JG1IN7pZWo: {
      type: {
        resolvedName: 'AgeWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: {
          [locale]: formatMessage(messages.usersByAge),
        },
      },
      custom: {},
      hidden: false,
      parent: 'USaN-ksTRN',
      isCanvas: false,
      displayName: 'AgeWidget',
      linkedNodes: {},
    },
    'USaN-ksTRN': {
      type: {
        resolvedName: 'Container',
      },
      nodes: ['JG1IN7pZWo'],
      props: {},
      custom: {},
      hidden: false,
      parent: 'Xk1CtBYcqL',
      isCanvas: true,
      displayName: 'Container',
      linkedNodes: {},
    },
    Xk1CtBYcqL: {
      type: {
        resolvedName: 'TwoColumn',
      },
      nodes: [],
      props: {
        columnLayout: '1-1',
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'TwoColumn',
      linkedNodes: {
        left: 'USaN-ksTRN',
        right: 'e7KuRlvji7',
      },
    },
    dHLmPS52Ss: {
      type: {
        resolvedName: 'GenderWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: {
          [locale]: formatMessage(messages.usersByGender),
        },
      },
      custom: {},
      hidden: false,
      parent: 'e7KuRlvji7',
      isCanvas: false,
      displayName: 'GenderWidget',
      linkedNodes: {},
    },
    e7KuRlvji7: {
      type: {
        resolvedName: 'Container',
      },
      nodes: ['dHLmPS52Ss'],
      props: {},
      custom: {},
      hidden: false,
      parent: 'Xk1CtBYcqL',
      isCanvas: true,
      displayName: 'Container',
      linkedNodes: {},
    },
    glFgBKdUAs: {
      type: {
        resolvedName: 'CommentsByTimeWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: {
          [locale]: formatMessage(messages.comments),
        },
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'CommentsByTimeWidget',
      linkedNodes: {},
    },
    sE49Spf_DM: {
      type: {
        resolvedName: 'PostsByTimeWidget',
      },
      nodes: [],
      props: {
        startAt,
        endAt,
        projectId,
        title: {
          [locale]: formatMessage(messages.inputs),
        },
      },
      custom: {},
      hidden: false,
      parent: 'ROOT',
      isCanvas: false,
      displayName: 'PostsByTimeWidget',
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
