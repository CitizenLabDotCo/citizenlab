import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

interface EvaluateParams {
  id: string;
  locale: string;
  model: string;
}

export interface EvaluationResult {
  model: string;
  model_response: string;
  parsed_response: Record<string, any>[] | null;
  ground_truth: Record<string, any>[];
  response_time_ms: number;
}

const evaluateBenchmark = async ({
  id,
  locale,
  model,
}: EvaluateParams): Promise<EvaluationResult> => {
  const jwt = getJwt();

  const res = await fetch(
    `${API_PATH}/importer/formsync_benchmarks/${id}/evaluate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ locale, model }),
    }
  );

  if (!res.ok) {
    const error = await res.json();
    throw error as CLErrors;
  }

  return res.json();
};

const useEvaluateFormsyncBenchmark = () => {
  return useMutation<EvaluationResult, CLErrors, EvaluateParams>({
    mutationFn: evaluateBenchmark,
  });
};

export default useEvaluateFormsyncBenchmark;
