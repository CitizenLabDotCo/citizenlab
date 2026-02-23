import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

interface SaveBenchmarkParams {
  name: string;
  locale: string;
  ground_truth: Record<string, any>[];
  pdf_base64: string;
}

interface SaveBenchmarkResponse {
  id: string;
  name: string;
  locale: string;
  created_at: string;
  question_count: number;
  question_types: string[];
}

const saveBenchmark = async (
  params: SaveBenchmarkParams
): Promise<SaveBenchmarkResponse> => {
  const jwt = getJwt();

  const res = await fetch(`${API_PATH}/importer/formsync_benchmarks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify(params),
  });

  if (!res.ok) {
    const error = await res.json();
    throw error as CLErrors;
  }

  return res.json();
};

const useSaveFormsyncBenchmark = () => {
  const queryClient = useQueryClient();

  return useMutation<SaveBenchmarkResponse, CLErrors, SaveBenchmarkParams>({
    mutationFn: saveBenchmark,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['formsync_benchmarks'] });
    },
  });
};

export default useSaveFormsyncBenchmark;
