import { renderHook, act } from '@testing-library/react-hooks';

import useBlockUser from './useBlockUser';
import { IUser } from 'api/users/types';
import { makeUser } from 'api/users/__mocks__/useUsers';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

export const userData: IUser = makeUser();

const apiPath = '*users/:id/block';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: userData }));
  })
);

describe('useBlockUser', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useBlockUser(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        userId: 'id',
        reason: 'a reason',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useBlockUser(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        userId: 'id',
        reason: '',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
