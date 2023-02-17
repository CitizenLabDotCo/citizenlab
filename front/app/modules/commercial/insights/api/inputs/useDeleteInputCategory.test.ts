import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteInputCategory from './useDeleteInputCategory';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*insights/views/:viewId/inputs/:inputId/categories/:id';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteInputCategory', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteInputCategory(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputId: 'inputId',
        categoryId: 'categoryId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteInputCategory(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputId: 'inputId',
        categoryId: 'categoryId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
