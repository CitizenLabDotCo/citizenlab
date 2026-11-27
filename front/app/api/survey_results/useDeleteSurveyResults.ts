import { useMutation, useQueryClient } from '@tanstack/react-query';

import phaseInsightsKeys from 'api/phase_insights/keys';
import phasesKeys from 'api/phases/keys';
import submissionsCountKeys from 'api/submission_count/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyResultsKeys from './keys';

const deleteSurveyResults = ({ phaseId }: { phaseId?: string }) => {
  const deleteApiEndpoint = `phases/${phaseId}/inputs`;
  return fetcher({
    path: `/${deleteApiEndpoint}`,
    action: 'delete',
  });
};

const useDeleteSurveyResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSurveyResults,
    onSuccess: (_data, { phaseId }) => {
      queryClient.invalidateQueries({
        queryKey: submissionsCountKeys.item({ phaseId }),
      });
      queryClient.invalidateQueries({
        queryKey: surveyResultsKeys.items(),
      });
      // The phase's Insights dashboard and response count show the deleted
      // responses until these refetch.
      if (phaseId) {
        queryClient.invalidateQueries({
          queryKey: phaseInsightsKeys.item({ phaseId }),
        });
      }
      queryClient.invalidateQueries({
        queryKey: phasesKeys.item({ phaseId }),
      });
    },
  });
};

export default useDeleteSurveyResults;
