import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useAddMembership from './useAddMembership';
import { membershipsData } from './useMemberships.test';

const apiPath = '*groups/:groupId/memberships';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: membershipsData[0] }));
  })
);

describe('useAddMembership', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        groupId: '1',
        userId: '2',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(membershipsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddMembership(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        groupId: '1',
        userId: '2',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
