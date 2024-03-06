import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import navbarKeys from './keys';
import { INavbarItemResponse } from './types';

type IReorderNavbarItem = {
  id: string;
  ordering: number;
};

const reorderNavbarItem = ({ id, ordering }: IReorderNavbarItem) =>
  fetcher<INavbarItemResponse>({
    path: `/nav_bar_items/${id}/reorder`,
    action: 'patch',
    body: { nav_bar_item: { ordering } },
  });

const useReorderNavbarItem = () => {
  const queryClient = useQueryClient();
  return useMutation<INavbarItemResponse, CLErrors, IReorderNavbarItem>({
    mutationFn: reorderNavbarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: navbarKeys.all() });
    },
  });
};

export default useReorderNavbarItem;
