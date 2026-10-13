import React, { ReactNode } from 'react';

import { Box, Spinner, bo, colors } from '@citizenlab/cl2-component-library';

import { ICauses } from 'api/causes/types';
import useCauses from 'api/causes/useCauses';
import { IPhaseData } from 'api/phases/types';
import { IPollResponses } from 'api/poll_responses/types';
import usePollResponses from 'api/poll_responses/usePollResponses';
import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import OfflineCollection from '../InputManager/RightColumn/OfflineCollection';
import messages from '../messages';

import EmptyState from './EmptyState';
import { PhaseViewKey } from './usePhaseViews';

const SIDE_PANEL_WIDTH = 'clamp(320px, 30vw, 384px)';

const EMPTY_COPY = {
  manage: {
    title: messages.noInputsYet,
    description: messages.noInputsYetDescription,
  },
  insights: {
    title: messages.noInsightsYet,
    description: messages.noInsightsYetDescription,
  },
};

interface Responses {
  causes?: ICauses;
  pollResponses?: IPollResponses;
}

// Offline votes and inputs count.
// Polls and volunteering have no phase count, so they're only checked on Insights.
const isPhaseEmpty = (
  { attributes }: IPhaseData,
  view: Props['view'],
  { causes, pollResponses }: Responses
) => {
  switch (attributes.participation_method) {
    case 'voting':
      if (view === 'manage') return attributes.ideas_count === 0;
      return (
        attributes.total_votes_amount === 0 && !attributes.manual_voters_amount
      );
    case 'volunteering':
      return (
        !!causes &&
        causes.data.every((cause) => cause.attributes.volunteers_count === 0)
      );
    case 'poll':
      return (
        !!pollResponses &&
        Object.keys(pollResponses.data.attributes.series.options).length === 0
      );
    default:
      return attributes.ideas_count === 0;
  }
};

interface Props {
  project: IProjectData;
  phase: IPhaseData;
  view: Exclude<PhaseViewKey, 'build'>;
  children: ReactNode;
}

const ViewContent = ({ project, phase, view, children }: Props) => {
  const { formatMessage } = useIntl();
  const onInsights = view === 'insights';
  const method = phase.attributes.participation_method;
  const checksCauses = onInsights && method === 'volunteering';
  const checksPoll = onInsights && method === 'poll';
  const causesQuery = useCauses({ phaseId: checksCauses ? phase.id : null });
  const pollQuery = usePollResponses({
    phaseId: checksPoll ? phase.id : null,
  });

  const isPending =
    causesQuery.isLoading ||
    pollQuery.isLoading ||
    (checksCauses && causesQuery.isPlaceholderData) ||
    (checksPoll && pollQuery.isPlaceholderData);

  if (isPending) {
    return (
      <Box
        flexGrow={1}
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <Spinner />
      </Box>
    );
  }

  const responses = {
    causes: checksCauses ? causesQuery.data : undefined,
    pollResponses: checksPoll ? pollQuery.data : undefined,
  };

  if (!isPhaseEmpty(phase, view, responses)) {
    return <>{children}</>;
  }

  const copy = EMPTY_COPY[view];

  return (
    <>
      <Box
        flexGrow={1}
        minWidth="0"
        minHeight="0"
        overflowY="auto"
        borderRadius={bo.panelBorderRadius}
        background={colors.white}
      >
        <EmptyState
          size="large"
          title={formatMessage(copy.title)}
          description={formatMessage(copy.description)}
        />
      </Box>
      <Box
        flex={`0 0 ${SIDE_PANEL_WIDTH}`}
        width={SIDE_PANEL_WIDTH}
        minHeight="0"
        overflowY="auto"
        borderRadius={bo.panelBorderRadius}
        background={colors.white}
      >
        {view === 'manage' ? (
          <Box p="16px">
            <OfflineCollection project={project} phase={phase} />
          </Box>
        ) : (
          <EmptyState
            size="small"
            description={formatMessage(messages.recommendedActionsHint)}
          />
        )}
      </Box>
    </>
  );
};

export default ViewContent;
