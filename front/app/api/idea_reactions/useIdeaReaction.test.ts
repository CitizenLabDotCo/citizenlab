import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IIdeaReaction } from './types';
import useIdeaReaction from './useIdeaReaction';

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
  http.get(apiPath, () => {
    return HttpResponse.json({ data: reactionData }, { status: 200 });
  })
);

describe('useIdeaReaction', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useIdeaReaction('ideaId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(reactionData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useIdeaReaction('ideaId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
