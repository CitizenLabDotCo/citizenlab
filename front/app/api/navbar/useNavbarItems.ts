import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import navbarKeys from './keys';
import { INavbarItems, NavbarKeys, NavbarParameters } from './types';

const fetchNavbarItems = ({
  onlyDefaultItems,
  onlyRemovedDefaultItems,
}: NavbarParameters) =>
  fetcher<INavbarItems>({
    path: `/nav_bar_items${
      onlyRemovedDefaultItems ? '/removed_default_items' : ''
    }`,
    action: 'get',
    queryParams: {
      only_default: onlyDefaultItems,
    },
  });

const useNavbarItems = (params?: NavbarParameters) => {
  return useQuery<INavbarItems, CLErrors, INavbarItems, NavbarKeys>({
    queryKey: navbarKeys.list({
      onlyDefaultItems: params?.onlyDefaultItems,
      onlyRemovedDefaultItems: params?.onlyRemovedDefaultItems,
    }),
    queryFn: () =>
      fetchNavbarItems({
        onlyDefaultItems: params?.onlyDefaultItems,
        onlyRemovedDefaultItems: params?.onlyRemovedDefaultItems,
      }),
  });
};

export default useNavbarItems;
