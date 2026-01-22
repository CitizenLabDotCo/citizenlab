import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { globalTopicsData } from './__mocks__/useGlobalTopics';
import { IGlobalTopicsQueryParams } from './types';
import useGlobalTopics from './useGlobalTopics';

const apiPath = '*/:type/:id/global_topics';

const params: IGlobalTopicsQueryParams = {};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: globalTopicsData }, { status: 200 });
  })
);

describe('useGlobalTopics', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useGlobalTopics(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(globalTopicsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useGlobalTopics(params), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
