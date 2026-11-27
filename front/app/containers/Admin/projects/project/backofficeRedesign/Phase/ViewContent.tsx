import React, { ReactNode } from 'react';

import { PhaseInsightsParticipationMetrics } from 'api/phase_insights/types';
import usePhaseInsights from 'api/phase_insights/usePhaseInsights';
import { IPhaseData } from 'api/phases/types';

import { useIntl } from 'utils/cl-intl';

import OfflineCollection from '../InputManager/SideColumn/OfflineCollection';
import useInputTermLabels from '../InputManager/useInputTermLabels';
import InsightsSkeleton from '../WorkspaceSkeleton/InsightsSkeleton';

import EmptyState from './EmptyState';
import LateParticipationDescription from './LateParticipationDescription';
import ManageLayout from './ManageLayout';
import messages from './messages';
import { PhaseViewKey } from './usePhaseViews';
import styles from './ViewContent.module.css';
import 'design-system/tokens.css';

// The library's empty views: the notebook and one sentence on what the view is for.
const EMPTY_COPY = {
  manage: messages.manageEmpty,
  insights: messages.insightsEmpty,
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
    // Visitors are all a document's Insights count, so zero visitors is its
    // dashboard's answer rather than an empty view.
    if (!metrics || attributes.participation_method === 'document_annotation') {
      return false;
    }

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

// Admins can add participation after a phase ends (paper forms, offline
// votes). Insights only counts what falls inside the phase dates, so such a
// phase looks empty there although it has participation.
const LATE_PARTICIPATION_METHODS = [
  'ideation',
  'proposals',
  'voting',
  'native_survey',
];

const hasParticipationOutsideDates = ({ attributes }: IPhaseData) => {
  if (!LATE_PARTICIPATION_METHODS.includes(attributes.participation_method)) {
    return false;
  }

  if (attributes.participation_method === 'voting') {
    return attributes.votes_count + attributes.manual_votes_count > 0;
  }

  return attributes.ideas_count > 0;
};

interface Props {
  phase: IPhaseData;
  view: Exclude<PhaseViewKey, 'build'>;
  children: ReactNode;
}

const ViewContent = ({ phase, view, children }: Props) => {
  const { formatMessage } = useIntl();
  const { terms } = useInputTermLabels();
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

  if (isPending) return <InsightsSkeleton />;

  const responses = {
    metrics: supportsMetrics
      ? insightsQuery.data?.data.attributes.metrics
      : undefined,
  };

  if (!isPhaseEmpty(phase, view, responses)) {
    return <>{children}</>;
  }

  const emptyState = (
    <EmptyState
      size="large"
      illustrated
      description={formatMessage(EMPTY_COPY[view], { terms })}
    />
  );

  // Only a phase with an end date can have participation after it.
  const lateEndAt =
    onInsights && hasParticipationOutsideDates(phase)
      ? phase.attributes.end_at
      : null;

  if (view === 'manage') {
    return (
      <ManageLayout side={<OfflineCollection phase={phase} />}>
        {emptyState}
      </ManageLayout>
    );
  }

  return (
    <>
      {/* The actions column, before the dashboard, shows only the small notebook. */}
      <div className={styles.sidePanel}>
        <EmptyState size="small" illustrated />
      </div>
      <div className={styles.main}>
        {lateEndAt ? (
          <EmptyState
            size="large"
            illustrated
            title={formatMessage(messages.noParticipationInPhaseDates)}
            description={
              <LateParticipationDescription phase={phase} endAt={lateEndAt} />
            }
          />
        ) : (
          emptyState
        )}
      </div>
    </>
  );
};

export default ViewContent;
