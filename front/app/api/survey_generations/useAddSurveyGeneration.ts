import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import surveyGenerationJobKeys from './keys';
import { AddSurveyGenerationParams } from './types';

// Starts the background generation job. Resolves to null (fetcher does not parse
// 202 bodies); track the job via useSurveyGenerationJob.
const addSurveyGeneration = ({
  phaseId,
  prompt,
  locale,
  fileIds,
}: AddSurveyGenerationParams) =>
  fetcher<null>({
    path: `/phases/${phaseId}/survey_generations`,
    action: 'post',
    body: {
      survey_generation: { prompt, locale, file_ids: fileIds },
    },
  });

const useAddSurveyGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation<null, CLErrors, AddSurveyGenerationParams>({
    mutationFn: addSurveyGeneration,
    onSettled: (_data, _error, { phaseId }) => {
      // Starts the polling, also on a 409, to show the job that is already running.
      queryClient.invalidateQueries({
        queryKey: surveyGenerationJobKeys.list({ phaseId }),
      });
    },
  });
};

export default useAddSurveyGeneration;
