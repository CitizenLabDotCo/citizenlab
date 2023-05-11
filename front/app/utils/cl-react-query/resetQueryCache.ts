import { queryClient } from './queryClient';

export const resetQueryCache = async () => {
  queryClient.invalidateQueries();
};
