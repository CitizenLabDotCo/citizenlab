import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { makeUser } from 'api/users/__mocks__/useUsers';
import { IUser } from 'api/users/types';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useUnblockUser from './useUnblockUser';

export const userData: IUser = makeUser();

const apiPath = '*users/:id/unblock';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: userData }));
  })
);

describe('useUnblockUser', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUnblockUser(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUnblockUser(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate('id');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
