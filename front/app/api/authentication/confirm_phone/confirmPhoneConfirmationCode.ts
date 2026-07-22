import meKeys from 'api/me/keys';

import fetcher from 'utils/cl-react-query/fetcher';
import { queryClient } from 'utils/cl-react-query/queryClient';

export const confirmCodeNewPhone = async (code: string) => {
  try {
    await fetcher({
      path: `/user/confirm_code_new_phone`,
      action: 'post',
      body: {
        confirmation: { code },
      },
    });

    queryClient.invalidateQueries({ queryKey: meKeys.all() });

    return true;
  } catch (errors) {
    throw errors.errors;
  }
};
