import { useQuery } from '@tanstack/react-query';

import { API_PATH } from 'containers/App/constants';

import { getJwt } from 'utils/auth/jwt';

export interface BenchmarkSummary {
  id: string;
  name: string;
  locale: string;
  created_at: string;
  question_count: number;
  question_types: string[];
  page_count: number | null;
}

interface BenchmarksResponse {
  benchmarks: BenchmarkSummary[];
}

const fetchBenchmarks = async (
  locale?: string
): Promise<BenchmarksResponse> => {
  const jwt = getJwt();
  const params = locale ? `?locale=${encodeURIComponent(locale)}` : '';

  const res = await fetch(`${API_PATH}/importer/formsync_benchmarks${params}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch benchmarks');
  }

  return res.json();
};

const useFormsyncBenchmarks = (locale?: string) => {
  return useQuery({
    queryKey: ['formsync_benchmarks', locale],
    queryFn: () => fetchBenchmarks(locale),
  });
};

export default useFormsyncBenchmarks;
