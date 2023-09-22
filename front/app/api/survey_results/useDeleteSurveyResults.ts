import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import surveyResultsKeys from './keys';
import submissionsCountKeys from 'api/submission_count/keys';

const deleteSurveyResults = ({
  projectId,
  phaseId,
}: {
  projectId: string;
  phaseId?: string;
}) => {
  const deleteApiEndpoint = phaseId
    ? `phases/${phaseId}/inputs`
    : `projects/${projectId}/inputs`;
  return fetcher({
    path: `/${deleteApiEndpoint}`,
    action: 'delete',
  });
};

const useDeleteSurveyResults = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSurveyResults,
    onSuccess: (_data, { projectId, phaseId }) => {
      queryClient.invalidateQueries(
        submissionsCountKeys.item({ projectId, phaseId })
      );
      queryClient.invalidateQueries({
        queryKey: surveyResultsKeys.items(),
      });
    },
  });
};

export default useDeleteSurveyResults;
