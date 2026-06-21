import { useMutation, useQueryClient } from '@tanstack/react-query';

import navbarKeys from 'api/navbar/keys';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';

const deleteCustomPage = (id: string) =>
  fetcher({
    path: `/static_pages/${id}`,
    action: 'delete',
  });

const useDeleteCustomPage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCustomPage,
    onSuccess: async () => {
      // Invalidate via `all()` rather than `lists()`: project-scoped lists are
      // keyed with `parameters: { projectId }`, which a `lists()` (parameters:
      // undefined) filter does not partially match.
      queryClient.invalidateQueries({
        queryKey: customPagesKeys.all(),
      });
      queryClient.invalidateQueries({ queryKey: navbarKeys.lists() });
    },
  });
};

export default useDeleteCustomPage;
