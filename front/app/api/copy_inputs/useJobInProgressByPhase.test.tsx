import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import useCommonGroundResults from 'api/common_ground/useCommonGroundResults';
import ideasKeys from 'api/ideas/keys';
import useIdeasFilterCounts from 'api/ideas_filter_counts/useIdeasFilterCounts';
import { IJobData } from 'api/jobs/types';

import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useJobInProgressByPhase from './useJobInProgressByPhase';

const job: IJobData = {
  id: 'import-1',
  type: 'job',
  attributes: {
    progress: 0,
    error_count: 0,
    total: 2,
    completed_at: null,
    created_at: '2026-11-11T10:00:00Z',
    updated_at: '2026-11-11T10:00:00Z',
    job_type: 'CopyInputsJob',
    errors: [],
  },
  relationships: {
    owner: { data: { id: 'admin-1', type: 'user' } },
    project: { data: { id: 'project-1', type: 'project' } },
    context: { data: { id: 'phase-1', type: 'phase' } },
  },
};

let importing = true;
const server = setupServer(
  http.get('*/jobs', () => HttpResponse.json({ data: importing ? [job] : [] })),
  http.get('*/ideas/filter_counts', () =>
    HttpResponse.json({ data: { attributes: { total: importing ? 0 : 2 } } })
  ),
  http.get('*/phases/phase-1/common_ground_results', () =>
    HttpResponse.json({
      data: { attributes: { stats: { num_ideas: importing ? 0 : 2 } } },
    })
  )
);

describe('useJobInProgressByPhase', () => {
  beforeAll(() => server.listen());
  beforeEach(() => {
    importing = true;
  });
  afterAll(() => server.close());

  it('refreshes the list, counts and results when an import finishes', async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, staleTime: Infinity } },
    });
    const listKey = ideasKeys.list({ phase: 'phase-1' });
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
    const { result, unmount } = renderHook(
      () => ({
        jobs: useJobInProgressByPhase('phase-1'),
        counts: useIdeasFilterCounts({ phase: 'phase-1' }),
        results: useCommonGroundResults('phase-1'),
      }),
      { wrapper }
    );

    await waitFor(() => {
      expect(result.current.jobs.data?.data).toHaveLength(1);
      expect(result.current.counts.data?.data.attributes.total).toBe(0);
      expect(result.current.results.data?.data.attributes.stats.num_ideas).toBe(
        0
      );
    });
    queryClient.setQueryData(listKey, { data: [] });

    importing = false;
    await result.current.jobs.refetch();

    await waitFor(() => {
      expect(result.current.jobs.data?.data).toHaveLength(0);
      expect(queryClient.getQueryState(listKey)?.isInvalidated).toBe(true);
      expect(result.current.counts.data?.data.attributes.total).toBe(2);
      expect(result.current.results.data?.data.attributes.stats.num_ideas).toBe(
        2
      );
    });

    unmount();
    queryClient.clear();
  });
});
