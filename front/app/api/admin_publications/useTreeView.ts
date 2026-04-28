import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import adminPublicationsKeys from './keys';
import { AdminPublicationsKeys, TreeView } from './types';

const fetchTreeView = () => {
  return fetcher<TreeView>({
    path: '/admin_publications/tree_view',
    action: 'get',
  });
};

const useTreeView = () => {
  return useQuery<TreeView, CLErrors, TreeView, AdminPublicationsKeys>({
    queryKey: adminPublicationsKeys.list({
      type: 'tree_view',
    }),
    queryFn: () => fetchTreeView(),
  });
};

export default useTreeView;
