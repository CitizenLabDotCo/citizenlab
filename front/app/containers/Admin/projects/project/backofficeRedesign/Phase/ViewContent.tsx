import React, { ReactNode } from 'react';

import Spinner from 'design-system/Spinner';
import 'design-system/tokens.css';

import { ICauses } from 'api/causes/types';
import useCauses from 'api/causes/useCauses';
import { IPhaseData } from 'api/phases/types';
import { IPollResponses } from 'api/poll_responses/types';
import usePollResponses from 'api/poll_responses/usePollResponses';
import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';

import OfflineCollection from '../InputManager/RightColumn/OfflineCollection';

import EmptyState from './EmptyState';
import messages from './messages';
import { PhaseViewKey } from './usePhaseViews';
import styles from './ViewContent.module.css';

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
      <div className={styles.loading}>
        <Spinner />
      </div>
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
      <div className={styles.main}>
        <EmptyState
          size="large"
          title={formatMessage(copy.title)}
          description={formatMessage(copy.description)}
        />
      </div>
      <div className={styles.sidePanel}>
        {view === 'manage' ? (
          <div className={styles.offlineCollection}>
            <OfflineCollection project={project} phase={phase} />
          </div>
        ) : (
          <EmptyState
            size="small"
            description={formatMessage(messages.recommendedActionsHint)}
          />
        )}
      </div>
    </>
  );
};

export default ViewContent;
