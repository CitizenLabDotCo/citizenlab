import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { usersData } from './__mocks__/_mockServer';
import useUpdateUser from './useUpdateUser';

const apiPath = '*users/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: usersData[0] }));
  })
);

describe('useUpdateUser', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        userId: 'id',
        first_name: 'Name',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(usersData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateUser(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        userId: 'id',
        first_name: 'Name',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
