import { useQueries } from '@tanstack/react-query';
import ideasPhasesKeys from './keys';
import { fetchIdeasPhase } from './useIdeasPhase';

const useIdeasPhases = (ids: string[]) => {
  const queries = ids.map((id) => ({
    queryKey: ideasPhasesKeys.item({ id }),
    queryFn: () => fetchIdeasPhase({ id }),
  }));

  return useQueries({ queries }).map((res) => res.data);
};

export default useIdeasPhases;
