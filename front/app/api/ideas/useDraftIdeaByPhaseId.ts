import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ phaseId }: { phaseId?: string }) =>
  fetcher<IIdea>({ path: `/ideas/draft/${phaseId}`, action: 'get' });

// Cache by idea id, not phase
const useDraftIdeaByPhaseId = (phaseId?: string, keepPreviousData?: boolean) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ id: phaseId }),
    queryFn: () => fetchIdea({ phaseId }),
    enabled: !!phaseId,
    refetchOnWindowFocus: false,
    keepPreviousData,
  });
};

export default useDraftIdeaByPhaseId;
