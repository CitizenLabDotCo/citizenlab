import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteCategory from './useDeleteCategory';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*insights/views/:viewId/categories/:id';
const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteCategory', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteCategory(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ viewId: 'viewId', categoryId: 'id' });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteCategory(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ viewId: 'viewId', categoryId: 'id' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
