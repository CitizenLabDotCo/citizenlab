import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { IInitiativeReactionData } from 'api/initiative_reactions/types';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useAddInitiativesReaction from './useAddInitiativeReaction';

const apiPath = '*initiatives/:initiativeId/reactions';

const reactionData: IInitiativeReactionData = {
  id: 'reactionId',
  type: 'reaction',
  attributes: {
    mode: 'up',
  },
  relationships: {
    reactable: {
      data: {
        id: 'initiativeId',
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
};

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: reactionData }));
  })
);

describe('useAddInitiativesReaction', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddInitiativesReaction(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(reactionData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddInitiativesReaction(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
