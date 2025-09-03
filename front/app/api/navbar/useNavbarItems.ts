import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { truncateMultiloc } from 'utils/textUtils';

import navbarKeys from './keys';
import { INavbarItems, NavbarKeys, NavbarParameters } from './types';
import { MAX_TITLE_LENGTH } from './util';

export const fetchNavbarItems = ({
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
  const result = useQuery<INavbarItems, CLErrors, INavbarItems, NavbarKeys>({
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

  const { data, ...rest } = result;

  const dataWithTruncatedTitles = data
    ? {
        ...data,
        data: data.data.map((item) => ({
          ...item,
          attributes: {
            ...item.attributes,
            title_multiloc: truncateMultiloc(
              item.attributes.title_multiloc,
              MAX_TITLE_LENGTH
            ),
          },
        })),
      }
    : undefined;

  return { data: dataWithTruncatedTitles, ...rest };
};

export default useNavbarItems;
