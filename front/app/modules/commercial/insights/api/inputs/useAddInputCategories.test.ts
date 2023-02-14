import { renderHook, act } from '@testing-library/react-hooks';

import useAddInputCategories from './useAddInputCategories';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import categories from '../../fixtures/categories';

const apiPath = '*insights/views/:viewId/inputs/:inputId/categories';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: categories }));
  })
);

describe('useAddInputCategories', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddInputCategories(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputId: 'inputId',
        categories: [{ id: 'id', type: 'category' }],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(categories);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddInputCategories(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputId: 'inputId',
        categories: [{ id: 'id', type: 'category' }],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
