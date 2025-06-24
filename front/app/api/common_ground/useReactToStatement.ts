import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import commonGroundProgressKeys from './keys/commonGroundProgressKeys';
import commonGroundResultsKeys from './keys/commonGroundResultsKeys';
import { ICommonGroundProgress, Params } from './types';

const reactToStatement = ({
  ideaId,
  mode,
}: Params): Promise<ICommonGroundProgress> =>
  fetcher<ICommonGroundProgress>({
    path: `/ideas/${ideaId}/reactions`,
    action: 'post',
    body: {
      reaction: {
        mode,
      },
    },
  });

const useReactToStatement = (phaseId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<ICommonGroundProgress, { errors: CLErrors }, Params>({
    mutationFn: ({ ideaId, mode }) => reactToStatement({ ideaId, mode }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commonGroundResultsKeys.list({ phaseId }),
      });
      queryClient.invalidateQueries({
        queryKey: commonGroundProgressKeys.list({ phaseId }),
      });
    },
  });
};

export default useReactToStatement;
