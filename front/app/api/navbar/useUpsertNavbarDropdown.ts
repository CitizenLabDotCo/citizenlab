import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import customPagesKeys from 'api/custom_pages/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import navbarKeys from './keys';
import { INavbarDropdown, INavbarItemResponse } from './types';

// Atomically creates or updates a dropdown ('menu') navbar item together with
// its ordered children in a single request.
const upsertNavbarDropdown = ({ id, ...attributes }: INavbarDropdown) => {
  if (id) {
    return fetcher<INavbarItemResponse>({
      path: `/nav_bar_items/${id}`,
      action: 'patch',
      body: { nav_bar_item: attributes },
    });
  }

  return fetcher<INavbarItemResponse>({
    path: '/nav_bar_items',
    action: 'post',
    body: { nav_bar_item: { code: 'menu', ...attributes } },
  });
};

const useUpsertNavbarDropdown = () => {
  const queryClient = useQueryClient();
  return useMutation<INavbarItemResponse, CLErrors, INavbarDropdown>({
    mutationFn: upsertNavbarDropdown,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: navbarKeys.all() });
      queryClient.invalidateQueries({ queryKey: customPagesKeys.lists() });
    },
  });
};

export default useUpsertNavbarDropdown;
