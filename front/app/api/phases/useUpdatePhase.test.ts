import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { phasesData } from './__mocks__/_mockServer';
import { IUpdatedPhaseProperties } from './types';
import useUpdatePhase from './useUpdatePhase';

const phasesMutationData: IUpdatedPhaseProperties = {
  commenting_enabled: false,
  description_multiloc: { en: 'For testing purposes' },
  reacting_dislike_enabled: false,
  reacting_dislike_limited_max: 0,
  reacting_dislike_method: 'limited',
  end_at: 'one week from now',
  input_term: 'idea',
  participation_method: 'information',
  submission_enabled: false,
  presentation_mode: 'card',
  start_at: 'today',
  title_multiloc: { en: 'A Mock Information phase' },
  reacting_like_limited_max: 0,
  reacting_like_method: 'limited',
  reacting_enabled: false,
  similarity_threshold_body: 0.5,
  similarity_threshold_title: 0.5,
  similarity_enabled: true,
};

const apiPath = '*phases/:phaseId';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: phasesData[0] }, { status: 200 });
  })
);

describe('useUpdatePhase', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdatePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(phasesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdatePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });

  it('starts refetches for the survey and edited phases together and awaits both', async () => {
    server.resetHandlers();
    let finishTarget = () => {};
    let finishOther = () => {};
    const target = new Promise<void>((resolve) => {
      finishTarget = resolve;
    });
    const other = new Promise<void>((resolve) => {
      finishOther = resolve;
    });
    const started: string[] = [];
    const { QueryClient } = await import('@tanstack/react-query');
    const invalidate = jest
      .spyOn(QueryClient.prototype, 'invalidateQueries')
      .mockImplementation((filters) => {
        const key = JSON.stringify(filters?.queryKey);
        if (key.includes('target-phase')) {
          started.push('target');
          return target;
        }
        if (key.includes('other-phase')) {
          started.push('other');
          return other;
        }
        return Promise.resolve();
      });
    try {
      const { result } = renderHook(() => useUpdatePhase(), {
        wrapper: createQueryClientWrapper(),
      });
      act(() =>
        result.current.mutate({
          phaseId: 'target-phase',
          timeline_phase_dates: [{ id: 'other-phase', end_at: '2026-06-10' }],
        })
      );
      await waitFor(() => expect(started).toEqual(['target', 'other']));
      expect(result.current.isPending).toBe(true);
      await act(async () => {
        finishTarget();
        finishOther();
      });
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    } finally {
      finishTarget();
      finishOther();
      invalidate.mockRestore();
    }
  });
  it('does not wait for background refetches after an ordinary phase edit', async () => {
    server.resetHandlers();
    let finishRefresh = () => {};
    const refreshing = new Promise<void>((resolve) => {
      finishRefresh = resolve;
    });
    const { QueryClient } = await import('@tanstack/react-query');
    const invalidate = jest
      .spyOn(QueryClient.prototype, 'invalidateQueries')
      .mockReturnValue(refreshing);
    try {
      const { result } = renderHook(() => useUpdatePhase(), {
        wrapper: createQueryClientWrapper(),
      });
      act(() =>
        result.current.mutate({ phaseId: 'phase', end_at: '2026-06-10' })
      );
      await waitFor(() => expect(result.current.isSuccess).toBe(true));
    } finally {
      finishRefresh();
      invalidate.mockRestore();
    }
  });
});
