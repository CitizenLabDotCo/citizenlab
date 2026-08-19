import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import {
  NO_PLACEHOLDER_DATA,
  queryClient,
} from 'utils/cl-react-query/queryClient';

import ideasKeys from './keys';
import { IIdea, IdeasKeys } from './types';

export const fetchIdea = ({ phaseId }: { phaseId?: string }) =>
  fetcher<IIdea>({ path: `/ideas/draft/${phaseId}`, action: 'get' });

const useDraftIdeaByPhaseId = (phaseId?: string) => {
  return useQuery<IIdea, CLErrors, IIdea, IdeasKeys>({
    queryKey: ideasKeys.item({ id: phaseId }),
    queryFn: () => fetchIdea({ phaseId }),
    enabled: !!phaseId,
    refetchOnWindowFocus: false,
    placeholderData: NO_PLACEHOLDER_DATA,
  });
};

export const clearDraftIdea = (phaseId?: string) => {
  queryClient.removeQueries({ queryKey: ideasKeys.item({ id: phaseId }) });
};

export default useDraftIdeaByPhaseId;
