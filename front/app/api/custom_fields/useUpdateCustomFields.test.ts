import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useUpdateCustomFields from './useUpdateCustomFields';

let apiPath = '*admin/phases/:phaseId/custom_fields/update_all';
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

  it('mutates data correctly in project', async () => {
    apiPath = '*admin/projects/:projectId/custom_fields/update_all';

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
