import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { TreeView, SpacesKeys } from './types';

const fetchTreeView = (id?: string) => {
  return fetcher<TreeView>({
    path: `/spaces/${id}/tree_view`,
    action: 'get',
  });
};

const useTreeView = (id?: string) => {
  return useQuery<TreeView, CLErrors, TreeView, SpacesKeys>({
    queryKey: spacesKeys.list({ id: id ?? '', type: 'tree_view' }),
    queryFn: () => fetchTreeView(id),
    enabled: !!id,
  });
};

export default useTreeView;
