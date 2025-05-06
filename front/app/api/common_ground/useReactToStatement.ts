import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import { USE_STUB_COMMON_GROUND } from './config';
import commonGroundResultsKeys from './keys/commonGroundResultsKeys';
import { reactToIdeaStub } from './stubs/progress';
import { ICommonGroundProgress, ReactToIdeaObject } from './types';

const reactToStatement = ({
  phaseId,
  ideaId,
  mode,
}: ReactToIdeaObject): Promise<ICommonGroundProgress> =>
  fetcher<ICommonGroundProgress>({
    path: `/phases/${phaseId}/common_ground/reactions`,
    action: 'post',
    body: { idea_id: ideaId, mode },
  });

const useReactToStatement = (phaseId: string | undefined) => {
  const queryClient = useQueryClient();
  return useMutation<
    ICommonGroundProgress,
    { errors: CLErrors },
    ReactToIdeaObject
  >({
    mutationFn: ({ ideaId, mode }) =>
      USE_STUB_COMMON_GROUND
        ? reactToIdeaStub(phaseId, ideaId, mode)
        : reactToStatement({ phaseId, ideaId, mode }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: commonGroundResultsKeys.list({ phaseId }),
      });
    },
  });
};

export default useReactToStatement;
