import { renderHook, act } from '@testing-library/react-hooks';

import useAddBasket from './useAddBasket';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { basketData } from './__mocks__/useBasket';

const apiPath = '*baskets';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: basketData }));
  })
);

describe('useAddBasket', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddBasket(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        user_id: 'id',
        participation_context_id: 'id',
        participation_context_type: 'Project',
        idea_ids: ['id'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(basketData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddBasket(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        user_id: 'id',
        participation_context_id: 'id',
        participation_context_type: 'Project',
        idea_ids: ['id'],
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
