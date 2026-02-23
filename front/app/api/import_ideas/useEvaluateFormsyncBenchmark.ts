import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

interface EvaluateParams {
  id: string;
  locale: string;
  model: string;
}

interface QuestionResult {
  id: number;
  type: string;
  text: string;
  fields: Record<string, number>;
  score: number;
  matched: boolean;
  ground_truth: Record<string, any>;
  model_output: Record<string, any> | null;
}

interface TypeResult {
  score: number;
  count: number;
}

export interface EvaluationResult {
  model: string;
  model_response: string;
  parsed_response: Record<string, any>[] | null;
  response_time_ms: number;
  accuracy: {
    overall_score: number;
    total_fields: number;
    matched_fields: number;
    by_question: QuestionResult[];
    by_type: Record<string, TypeResult>;
  } | null;
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
