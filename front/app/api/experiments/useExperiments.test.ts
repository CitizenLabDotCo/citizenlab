import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { experimentsData } from './__mocks__/useExperiments';
import useExperiments from './useExperiments';

const apiPath = '*/experiments';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: experimentsData }, { status: 200 });
  })
);

describe('useExperiments', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useExperiments(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(experimentsData);
  });
});
