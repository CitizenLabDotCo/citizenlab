import { renderHook, act } from '@testing-library/react-hooks';

import useAddInitiativesVote from './useAddInitiativeVote';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IInitiativeVoteData } from 'api/initiative_votes/types';

const apiPath = '*initiatives/:initiativeId/votes';

const voteData: IInitiativeVoteData = {
  id: 'voteId',
  type: 'vote',
  attributes: {
    mode: 'up',
  },
  relationships: {
    votable: {
      data: {
        id: 'initiativeId',
        type: 'votable',
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
    return res(ctx.status(200), ctx.json({ data: voteData }));
  })
);

describe('useAddInitiativesVote', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddInitiativesVote(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        mode: 'up',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(voteData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddInitiativesVote(), {
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
