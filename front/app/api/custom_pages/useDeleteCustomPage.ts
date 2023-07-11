import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import customPagesKeys from './keys';
import streams from 'utils/streams';
import { apiEndpoint as navbarEndpoint } from 'services/navbar';

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
      queryClient.invalidateQueries({
        queryKey: customPagesKeys.lists(),
      });
      await streams.fetchAllWith({ apiEndpoint: [navbarEndpoint] });
    },
  });
};

export default useDeleteCustomPage;
