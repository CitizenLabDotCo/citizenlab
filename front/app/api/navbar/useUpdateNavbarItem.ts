import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import navbarKeys from './keys';
import { INavbarItemResponse, INavbarItemUpdate } from './types';

const updateNavbarItem = ({ id, ...requestBody }: INavbarItemUpdate) =>
  fetcher<INavbarItemResponse>({
    path: `/nav_bar_items/${id}`,
    action: 'patch',
    body: { nav_bar_item: requestBody },
  });

const useUpdateNavbarItem = () => {
  const queryClient = useQueryClient();
  return useMutation<INavbarItemResponse, CLErrors, INavbarItemUpdate>({
    mutationFn: updateNavbarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: navbarKeys.all() });
    },
  });
};

export default useUpdateNavbarItem;
