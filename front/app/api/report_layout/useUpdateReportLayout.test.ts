import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { reportLayout, apiPathUpdate } from './__mocks__/_mockServer';
import useUpdateReportLayout from './useUpdateReportLayout';

const server = setupServer(
  http.patch(apiPathUpdate, () => {
    return HttpResponse.json(reportLayout, { status: 200 });
  })
);

describe('useUpdateReportLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateReportLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        craftjs_json: {},
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(reportLayout.data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPathUpdate, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateReportLayout(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        craftjs_json: {},
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
