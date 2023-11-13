import { renderHook, act } from '@testing-library/react-hooks';

import useChangePassword from './useChangePassword';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { usersData } from './__mocks__/_mockServer';

const apiPath = '*users/update_password';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: usersData[0] }));
  })
);

describe('useChangePassword', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useChangePassword(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        current_password: 'old_password',
        password: 'new_password',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(usersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useChangePassword(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        current_password: 'old_password',
        password: 'new_password',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
