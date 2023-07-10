import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import navbarKeys from './keys';
import { INavbarItemResponse, INavbarItemAdd } from './types';
import { IItemNotInNavbar } from 'utils/navbar';
import customPagesKeys from 'api/custom_pages/keys';

const addNavbarItem = async (item: IItemNotInNavbar) => {
  const navbarItem: INavbarItemAdd =
    item.type === 'default_item'
      ? {
          code: item.navbarCode,
          title_multiloc: item.navbarTitleMultiloc,
        }
      : {
          code: 'custom',
          static_page_id: item.pageId,
          title_multiloc: item.pageTitleMultiloc,
        };
  return fetcher<INavbarItemResponse>({
    path: '/nav_bar_items',
    action: 'post',
    body: { nav_bar_item: navbarItem },
  });
};

const useAddNavbarItem = () => {
  const queryClient = useQueryClient();
  return useMutation<INavbarItemResponse, CLErrors, IItemNotInNavbar>({
    mutationFn: addNavbarItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: navbarKeys.all() });
      queryClient.invalidateQueries({
        queryKey: customPagesKeys.lists(),
      });
    },
  });
};

export default useAddNavbarItem;
