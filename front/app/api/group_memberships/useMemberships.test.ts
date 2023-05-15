import { renderHook } from '@testing-library/react-hooks';

import useMemberships from './useMemberships';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IParameters } from './types';

const apiPath = '*groups/:groupId/memberships';

const params: IParameters = {
  groupId: '1',
  page: {
    size: 10,
    number: 1,
  },
};

export const membershipsData = [
  {
    id: '1',
    type: 'membership',
    relationships: {
      user: {
        data: {
          id: '1',
          type: 'user',
        },
      },
    },
  },
  {
    id: '2',
    type: 'membership',
    relationships: {
      user: {
        data: {
          id: '2',
          type: 'user',
        },
      },
    },
  },
];

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: membershipsData }));
  })
);

describe('useMemberships', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useMemberships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(membershipsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useMemberships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
