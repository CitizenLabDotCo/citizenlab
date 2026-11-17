import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import usePhase from 'api/phases/usePhase';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useUpdateCustomFields from './useUpdateCustomFields';

let apiPath = '*phases/:phaseId/custom_fields/update_all';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: [] }, { status: 200 });
  })
);

describe('useUpdateCustomFields', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly in phase', async () => {
    const { result } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        phaseId: 'dummyId',
        customFields: [],
        customForm: { saveType: 'manual', openedAt: '2021-01-01' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
  });

  it('refreshes the phase persistence state after saving its questions', async () => {
    let saved = false;
    server.use(
      http.get('*phases/persistence-test', () =>
        HttpResponse.json({
          data: {
            id: 'persistence-test',
            attributes: { custom_form_persisted: saved },
          },
        })
      ),
      http.patch('*phases/persistence-test/custom_fields/update_all', () => {
        saved = true;
        return HttpResponse.json({ data: [] });
      })
    );

    const { result } = renderHook(
      () => ({
        phase: usePhase('persistence-test'),
        update: useUpdateCustomFields(),
      }),
      { wrapper: createQueryClientWrapper() }
    );

    await waitFor(() =>
      expect(
        result.current.phase.data?.data.attributes.custom_form_persisted
      ).toBe(false)
    );

    await act(async () => {
      await result.current.update.mutateAsync({
        projectId: 'project',
        phaseId: 'persistence-test',
        customFields: [],
        customForm: { saveType: 'manual' },
      });
    });

    await waitFor(() =>
      expect(
        result.current.phase.data?.data.attributes.custom_form_persisted
      ).toBe(true)
    );
  });

  it('mutates data correctly in project', async () => {
    apiPath = '*projects/:projectId/custom_fields/update_all';

    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json({ data: [] }, { status: 200 });
      })
    );

    const { result } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        customFields: [],
        customForm: { saveType: 'manual', openedAt: '2021-01-01' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        customFields: [],
        customForm: { saveType: 'manual', openedAt: '2021-01-01' },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
