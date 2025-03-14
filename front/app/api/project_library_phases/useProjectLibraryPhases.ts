import { useQueries } from '@tanstack/react-query';

import projectLibraryPhasesKeys from './keys';
import { fetchProjectLibraryPhase } from './useProjectLibraryPhase';

const useProjectLibraryPhases = (ids: string[]) => {
  const queries = ids.map((id) => ({
    queryKey: projectLibraryPhasesKeys.item({ id }),
    queryFn: () => fetchProjectLibraryPhase(id),
  }));

  return useQueries({ queries }).map((res) => res.data);
};

export default useProjectLibraryPhases;
