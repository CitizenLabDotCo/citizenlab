import { useMutation, useQueryClient } from '@tanstack/react-query';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

interface DeleteBenchmarkParams {
  id: string;
  locale: string;
}

const deleteBenchmark = async ({
  id,
  locale,
}: DeleteBenchmarkParams): Promise<void> => {
  const jwt = getJwt();

  const res = await fetch(
    `${API_PATH}/importer/formsync_benchmarks/${id}?locale=${encodeURIComponent(
      locale
    )}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error('Failed to delete benchmark');
  }
};

const useDeleteFormsyncBenchmark = () => {
  const queryClient = useQueryClient();

  return useMutation<void, Error, DeleteBenchmarkParams>({
    mutationFn: deleteBenchmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formsync_benchmarks'] });
    },
  });
};

export default useDeleteFormsyncBenchmark;
