import { renderHook, act } from '@testing-library/react-hooks';

import useAddFollower from './useAddFollower';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { followersData } from './__mocks__/useFollowers';

const apiPath = '*followers';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: followersData[0] }));
  })
);

describe('useAddFollower', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(followersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddFollower(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        followableType: 'ideas',
        followableId: '1',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
