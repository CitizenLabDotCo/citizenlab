import meKeys from 'api/me/keys';
import { queryClient } from './queryClient';

export const resetQueryCache = async () => {
  await queryClient.resetQueries({
    queryKey: meKeys.all(),
  });
  await queryClient.invalidateQueries();
};
