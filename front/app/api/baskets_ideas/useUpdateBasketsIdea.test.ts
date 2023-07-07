import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateBasketsIdea from './useUpdateBasketsIdea';
import { basketsIdeasData } from './__mocks__/useBasketsIdeas';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*baskets_ideas/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: basketsIdeasData }));
  })
);

describe('useUpdateBasketsIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateBasketsIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        basketId: 'basketId',
        basketsIdeaId: 'basketIdeaId',
        votes: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(basketsIdeasData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateBasketsIdea(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        basketId: 'basketId',
        basketsIdeaId: 'basketIdeaId',
        votes: 2,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
