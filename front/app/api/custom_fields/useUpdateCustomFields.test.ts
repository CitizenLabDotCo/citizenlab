import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateCustomFields from './useUpdateCustomFields';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

let apiPath = '*admin/phases/:phaseId/custom_fields/update_all';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: [] }));
  })
);

describe('useUpdateCustomFields', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly in phase', async () => {
    const { result, waitFor } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        phaseId: 'dummyId',
        customFields: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
  });

  it('mutates data correctly in project', async () => {
    apiPath = '*admin/projects/:projectId/custom_fields/update_all';

    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: [] }));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        customFields: [],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'dummyId',
        customFields: [],
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
