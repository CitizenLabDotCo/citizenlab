import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IParameters } from './types';
import useMemberships from './useMemberships';

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
  http.get(apiPath, () => {
    return HttpResponse.json({ data: membershipsData }, { status: 200 });
  })
);

describe('useMemberships', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useMemberships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(membershipsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useMemberships(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
