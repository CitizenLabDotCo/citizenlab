import meKeys from 'api/me/keys';
import { queryClient } from './queryClient';

export const resetMeQuery = async () => {
  await queryClient.resetQueries({ queryKey: meKeys.all() });
};

export const invalidateQueryCache = () => {
  queryClient.invalidateQueries();
};
