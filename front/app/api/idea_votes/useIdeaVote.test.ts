import { renderHook } from '@testing-library/react-hooks';

import useIdeaReaction from './useIdeaReaction';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IIdeaReaction } from './types';

const apiPath = '*/reactions/:id';

export const reactionData: IIdeaReaction = {
  data: {
    id: 'reactionId',
    type: 'reaction',
    attributes: {
      mode: 'up',
    },
    relationships: {
      reactable: {
        data: {
          id: 'ideaId',
          type: 'reactable',
        },
      },
      user: {
        data: {
          id: 'userId',
          type: 'user',
        },
      },
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: reactionData }));
  })
);

describe('useIdeaReaction', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useIdeaReaction('ideaId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(reactionData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useIdeaReaction('ideaId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
