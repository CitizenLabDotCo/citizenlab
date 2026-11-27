import { useEffect } from 'react';

import { useQueryClient } from '@tanstack/react-query';

import analysisInputsKeys from 'api/analysis_inputs/keys';
import causesKeys from 'api/causes/keys';
import commonGroundResultsKeys from 'api/common_ground/keys/commonGroundResultsKeys';
import ideasKeys from 'api/ideas/keys';
import ideasFilterCountsKeys from 'api/ideas_filter_counts/keys';
import votingInsightsKeys from 'api/phase_insights/voting_insights/keys';
import pollResponsesKeys from 'api/poll_responses/keys';
import submissionsCountKeys from 'api/submission_count/keys';
import surveyResultsKeys from 'api/survey_results/keys';

// Participation the dashboard's sections read, which can change on another
// view (an input added in Manage) without these queries being told.
const PARTICIPATION_KEYS = [
  ideasKeys.lists(),
  ideasFilterCountsKeys.items(),
  votingInsightsKeys.all(),
  surveyResultsKeys.all(),
  submissionsCountKeys.all(),
  pollResponsesKeys.all(),
  causesKeys.all(),
  commonGroundResultsKeys.all(),
  analysisInputsKeys.all(),
];

// Opening Insights shows the participation as it is now, not as it was the
// last time the dashboard was open.
const useRefreshParticipationData = (phaseId: string, enabled: boolean) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    PARTICIPATION_KEYS.forEach((queryKey) =>
      queryClient.invalidateQueries({ queryKey })
    );
  }, [queryClient, phaseId, enabled]);
};

export default useRefreshParticipationData;
