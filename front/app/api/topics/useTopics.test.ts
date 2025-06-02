import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { topicsData } from './__mocks__/useTopics';
import { ITopicsQueryParams } from './types';
import useTopics from './useTopics';

const apiPath = '*/:type/:id/topics';

const params: ITopicsQueryParams = {};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: topicsData }, { status: 200 });
  })
);

describe('useTopics', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useTopics(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(topicsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useTopics(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
