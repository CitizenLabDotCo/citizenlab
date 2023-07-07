import { renderHook, act } from '@testing-library/react-hooks';

import useAddBasketsIdeas from './useAddBasketsIdeas';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { basketsIdeasData } from './__mocks__/useBasketsIdeas';

const apiPath = '*baskets/basketId/baskets_ideas';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: basketsIdeasData }));
  })
);

describe('useAddBasketsIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddBasketsIdeas(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        basketId: 'basketId',
        idea_id: 'ideaId',
        votes: 2,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(basketsIdeasData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddBasketsIdeas(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        basketId: 'basketId',
        idea_id: 'ideaId',
        votes: 2,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
