import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteMembership from './useDeleteMembership';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*groups/:groupId/memberships/by_user_id/:userId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteMembership', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ groupId: '1', userId: '2' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ groupId: '1', userId: '2' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
