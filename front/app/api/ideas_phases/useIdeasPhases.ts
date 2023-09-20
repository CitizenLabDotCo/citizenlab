import { useQueries } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import ideasPhasesKeys from './keys';
import { Params, IdeasPhase } from './types';

const fetchIdeasPhase = ({ id }: Params) =>
  fetcher<IdeasPhase>({ path: `/ideas_phases/${id}`, action: 'get' });

const useIdeasPhases = (ids: string[]) => {
  const queries = ids.map((id) => ({
    queryKey: ideasPhasesKeys.item({ id }),
    queryFn: () => fetchIdeasPhase({ id }),
  }));

  return useQueries({ queries }).map((res) => res.data);
};

export default useIdeasPhases;
