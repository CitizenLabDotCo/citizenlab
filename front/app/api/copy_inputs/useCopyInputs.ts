import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import jobsKeys from './keys';
import { IJob, CopyRequestParams } from './types';

const copyInputs = ({
  toPhaseId,
  fromPhaseId,
  dryRun = false,
  allowDuplicates = false,
}: CopyRequestParams) =>
  fetcher<IJob>({
    path: `/phases/${toPhaseId}/inputs/copy`,
    action: 'post',
    body: {
      filters: { phase: fromPhaseId },
      dry_run: dryRun,
      allow_duplicates: allowDuplicates,
    },
  });

const useCopyInputs = () => {
  const queryClient = useQueryClient();

  return useMutation<IJob, CLErrors, CopyRequestParams>({
    mutationFn: copyInputs,
    onSuccess: (_, { toPhaseId }) => {
      queryClient.invalidateQueries({
        queryKey: jobsKeys.list({ phaseId: toPhaseId }),
      });
    },
  });
};

export default useCopyInputs;
