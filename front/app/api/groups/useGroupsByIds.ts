import { useQueries } from '@tanstack/react-query';

import groupKeys from './keys';
import { fetchGroup } from './useGroup';

const useGroupsByIds = (groupIds: string[]) => {
  const queries = groupIds.map((id) => ({
    queryKey: groupKeys.item({ id }),
    queryFn: () => fetchGroup({ id }),
  }));

  return useQueries({ queries }).map((res) => res.data);
};

export default useGroupsByIds;
