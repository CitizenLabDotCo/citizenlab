import React, { ReactNode } from 'react';

import { Box, Spinner, bo, colors } from '@citizenlab/cl2-component-library';

import { PhaseInsightsParticipationMetrics } from 'api/phase_insights/types';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import OfflineCollection from '../InputManager/SideColumn/OfflineCollection';
import useInputTermLabels from '../InputManager/useInputTermLabels';

import EmptyState from './EmptyState';
import ManageLayout from './ManageLayout';
import messages from './messages';
import { PhaseViewKey } from './usePhaseViews';

const SIDE_PANEL_WIDTH = '308px';

const EMPTY_COPY = {
  manage: {
    title: messages.noTermsYet,
    description: messages.noTermsYetDescription,
  },
  insights: {
    title: messages.noActivityInDateRange,
    description: messages.insightsDateRange,
  },
};

interface Responses {
  metrics?: PhaseInsightsParticipationMetrics;
}

// Insights include visits and offline participation, even without inputs.
const isPhaseEmpty = (
  { attributes }: IPhaseData,
  view: Props['view'],
  { metrics }: Responses
) => {
  if (view === 'insights') {
    if (!metrics) return false;

    const activity = [
      metrics.visitors,
      metrics.participants ?? 0,
      metrics.ideation?.ideas_posted ?? 0,
      metrics.ideation?.comments_posted ?? 0,
      metrics.ideation?.reactions ?? 0,
      metrics.proposals?.ideas_posted ?? 0,
      metrics.proposals?.comments_posted ?? 0,
      metrics.proposals?.reactions ?? 0,
      metrics.voting?.online_votes ?? 0,
      metrics.voting?.offline_votes ?? 0,
      metrics.budgeting?.online_picks ?? 0,
      metrics.budgeting?.offline_picks ?? 0,
      metrics.native_survey?.surveys_submitted ?? 0,
      metrics.survey?.surveys_submitted ?? 0,
      metrics.poll?.responses ?? 0,
      metrics.common_ground?.reactions ?? 0,
      metrics.volunteering?.volunteerings ?? 0,
    ];
    return activity.every((count) => count === 0);
  }

  // These managers provide their own empty state and collection actions.
  if (
    [
      'ideation',
      'proposals',
      'voting',
      'common_ground',
      'volunteering',
    ].includes(attributes.participation_method)
  ) {
    return false;
  }

  return attributes.ideas_count === 0;
};

interface Props {
  phase: IPhaseData;
  view: Exclude<PhaseViewKey, 'build'>;
  children: ReactNode;
}

const ViewContent = ({ phase, view, children }: Props) => {
  const { formatMessage } = useIntl();
  const { terms, capitalizedTerms } = useInputTermLabels();
  const onInsights = view === 'insights';
  const supportsMetrics =
    onInsights &&
    !['survey', 'information'].includes(phase.attributes.participation_method);
  const insightsQuery = usePhaseInsights({
    phaseId: phase.id,
    enabled: supportsMetrics,
  });
  const isPending =
    supportsMetrics &&
    (insightsQuery.isLoading || insightsQuery.isPlaceholderData);

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
    metrics: supportsMetrics
      ? insightsQuery.data?.data.attributes.metrics
      : undefined,
  };

  if (!isPhaseEmpty(phase, view, responses)) {
    return <>{children}</>;
  }

  const copy = EMPTY_COPY[view];
  const emptyState = (
    <EmptyState
      size="large"
      title={formatMessage(copy.title, { terms })}
      description={formatMessage(copy.description, { capitalizedTerms })}
    />
  );

  if (view === 'manage') {
    return (
      <ManageLayout side={<OfflineCollection phase={phase} />}>
        {emptyState}
      </ManageLayout>
    );
  }

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
        {emptyState}
      </Box>
      <Box
        flex={`0 0 ${SIDE_PANEL_WIDTH}`}
        width={SIDE_PANEL_WIDTH}
        minHeight="0"
        overflowY="auto"
        borderRadius={bo.panelBorderRadius}
        background={colors.white}
      >
        <EmptyState
          size="small"
          title={formatMessage(messages.noInsightsYet)}
        />
      </Box>
    </>
  );
};

export default ViewContent;
