import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ILockedAttributes } from './types';
import useUserLockedAttributes from './useUserLockedAttributes';

const apiPath = '*/users/me/locked_attributes';

const lockedAttributesData: ILockedAttributes = {
  data: [
    {
      type: 'locked_attribute',
      id: '1',
      attributes: {
        name: 'first_name',
      },
    },
  ],
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: lockedAttributesData }, { status: 200 });
  })
);

describe('useUserLockedAttributes', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useUserLockedAttributes(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(lockedAttributesData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUserLockedAttributes(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
