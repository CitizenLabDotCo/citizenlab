import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import adminPublicationsKeys from './keys';
import { AdminPublicationsKeys, TreeView } from './types';

const fetchTreeView = (space_id?: string) => {
  return fetcher<TreeView>({
    path: '/admin_publications/tree_view',
    action: 'get',
    queryParams: {
      space_id,
    },
  });
};

const useTreeView = (space_id?: string) => {
  return useQuery<TreeView, CLErrors, TreeView, AdminPublicationsKeys>({
    queryKey: adminPublicationsKeys.item({
      id: space_id ?? '',
      type: 'tree_view',
    }),
    queryFn: () => fetchTreeView(space_id),
  });
};

export default useTreeView;
