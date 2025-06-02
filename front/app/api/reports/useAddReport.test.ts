import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { reportsData } from './__mocks__/_mockServer';
import useAddReport from './useAddReport';

const apiPath = '*reports';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: reportsData[0] }, { status: 200 });
  })
);

describe('useAddReport', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddReport(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: 'test',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(reportsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddReport(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        name: 'test',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
