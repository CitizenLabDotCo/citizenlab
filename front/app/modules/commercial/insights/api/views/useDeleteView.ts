import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import viewKeys from './keys';
import { IInsightsViews } from './types';

const deleteView = (id: string) =>
  fetcher({
    path: `/insights/views/${id}`,
    action: 'delete',
  });

const useDeleteView = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteView,
    onMutate: async (id: string) => {
      // Cancel any outgoing refetches
      // (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: viewKeys.lists() });

      // Snapshot the previous value
      const previous = queryClient.getQueryData<IInsightsViews>(
        viewKeys.lists()
      );

      // Optimistically update to the new value
      queryClient.setQueryData(viewKeys.lists(), (old: IInsightsViews) => {
        const newData = {
          ...old,
          data: old.data.filter((item) => item.id !== id),
        };

        return newData;
      });

      // Return a context object with the snapshotted value
      return { previous };
    },
    onError: (_err, _newTodo, context) => {
      if (context?.previous) {
        queryClient.setQueryData<IInsightsViews>(
          viewKeys.lists(),
          context.previous
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: viewKeys.lists() });
    },
  });
};

export default useDeleteView;
