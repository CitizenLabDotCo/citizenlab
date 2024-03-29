import { useMutation, useQueryClient } from '@tanstack/react-query';

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
      queryClient.invalidateQueries(submissionsCountKeys.item({ phaseId }));
      queryClient.invalidateQueries({
        queryKey: surveyResultsKeys.items(),
      });
    },
  });
};

export default useDeleteSurveyResults;
