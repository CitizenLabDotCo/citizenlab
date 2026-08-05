import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { truncateMultiloc } from 'utils/textUtils';

import navbarKeys from './keys';
import { INavbarItems, NavbarKeys, NavbarParameters } from './types';
import { MAX_TITLE_LENGTH } from './util';

export const fetchNavbarItems = ({
  onlyRemovedDefaultItems,
}: NavbarParameters) =>
  fetcher<INavbarItems>({
    path: `/nav_bar_items${
      onlyRemovedDefaultItems ? '/removed_default_items' : ''
    }`,
    action: 'get',
  });

// Titles are truncated to MAX_TITLE_LENGTH for rendering in the (width-limited)
// navigation bar. The admin Menu editor needs the *full* stored title so that
// re-saving an item doesn't silently persist the truncated version, so it opts
// out via `truncateTitles: false`.
const useNavbarItems = (params?: NavbarParameters) => {
  // Client-side display concern, so it's excluded from the query key/fetch:
  // truncated and untruncated consumers share the same cached raw data.
  const truncateTitles = params?.truncateTitles ?? true;

  const result = useQuery<INavbarItems, CLErrors, INavbarItems, NavbarKeys>({
    queryKey: navbarKeys.list({
      onlyRemovedDefaultItems: params?.onlyRemovedDefaultItems,
    }),
    queryFn: () =>
      fetchNavbarItems({
        onlyRemovedDefaultItems: params?.onlyRemovedDefaultItems,
      }),
  });

  const { data, ...rest } = result;

  const transformedData =
    data && truncateTitles
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
      : data;

  return { data: transformedData, ...rest };
};

export default useNavbarItems;
