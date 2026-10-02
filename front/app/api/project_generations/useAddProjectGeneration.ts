import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectGenerationJobKeys from './keys';
import { AddProjectGenerationParams } from './types';

// Starts the background generation job. Resolves to null (fetcher does not parse
// 202 bodies); track the job via useProjectGenerationJob.
const addProjectGeneration = ({
  projectId,
  prompt,
  locale,
  fileIds,
  levers,
}: AddProjectGenerationParams) =>
  fetcher<null>({
    path: `/projects/${projectId}/project_generations`,
    action: 'post',
    body: {
      project_generation: {
        prompt,
        locale,
        file_ids: fileIds,
        levers,
      },
    },
  });

const useAddProjectGeneration = () => {
  const queryClient = useQueryClient();

  return useMutation<null, CLErrors, AddProjectGenerationParams>({
    mutationFn: addProjectGeneration,
    onSettled: (_data, _error, { projectId }) => {
      // Starts the polling, also on a 409, to show the job that is already running.
      queryClient.invalidateQueries({
        queryKey: projectGenerationJobKeys.list({ projectId }),
      });
    },
  });
};

export default useAddProjectGeneration;
