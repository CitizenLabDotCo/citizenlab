import { renderHook, act } from '@testing-library/react-hooks';

import useBatchAssignCategories from './useBatchAssignCategories';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*insights/views/:viewId/batch/assign_categories';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: {} }));
  })
);

describe('useBatchAssignCategories', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useBatchAssignCategories(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputs: ['inputId'],
        categories: ['categoryId'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useBatchAssignCategories(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        viewId: 'viewId',
        inputs: ['inputId'],
        categories: ['categoryId'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
