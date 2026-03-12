import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { TreeView, SpacesKeys } from './types';

const fetchTreeView = (spaceId?: string) => {
  if (!spaceId) {
    return fetcher<TreeView>({
      path: '/admin_publications/tree_view',
      action: 'get',
    });
  }

  return fetcher<TreeView>({
    path: `/spaces/${spaceId}/tree_view`,
    action: 'get',
  });
};

const useTreeView = (spaceId?: string) => {
  return useQuery<TreeView, CLErrors, TreeView, SpacesKeys>({
    queryKey: spacesKeys.item({ id: spaceId ?? '', type: 'tree_view' }),
    queryFn: () => fetchTreeView(spaceId),
  });
};

export default useTreeView;
