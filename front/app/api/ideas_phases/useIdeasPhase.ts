import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasPhasesKeys from './keys';
import { IdeasPhase, IdeasPhasesKeys, Params } from './types';

export const fetchIdeasPhase = ({ id }: Params) =>
  fetcher<IdeasPhase>({ path: `/ideas_phases/${id}`, action: 'get' });

const useIdeasPhase = (id?: string) => {
  return useQuery<IdeasPhase, CLErrors, IdeasPhase, IdeasPhasesKeys>({
    queryKey: ideasPhasesKeys.item({ id }),
    queryFn: () => fetchIdeasPhase({ id }),
    enabled: !!id,
    refetchOnWindowFocus: false,
  });
};

export default useIdeasPhase;
