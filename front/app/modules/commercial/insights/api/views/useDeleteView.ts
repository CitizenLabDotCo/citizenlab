import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import viewsKeys from './keys';
import { IInsightsViews } from './types';

const deleteView = (id: string) => {
  return fetcher({
    path: `/insights/views/${id}`,
    action: 'delete',
  });
};

const useDeleteView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteView,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: viewsKeys.lists() });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<IInsightsViews>(
        viewsKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData(
        viewsKeys.lists(),
        (old: IInsightsViews = { data: [] }) => {
          const newData = {
            ...old,
            data: old.data.filter((item) => item.id !== id),
          };

          return newData;
        }
      );

      // Return a context object with the snapshotted value
      return { previous };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previous) {
        queryClient.setQueryData<IInsightsViews>(
          viewsKeys.lists(),
          context.previous
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewsKeys.lists() });
    },
  });
};

export default useDeleteView;
