import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { apiPathReport, reportsData } from './__mocks__/_mockServer';
import useCopyReport from './useCopyReport';

const reportData = reportsData[0];
const apiCopyPath = `${apiPathReport}/copy`;

const server = setupServer(
  http.post(apiCopyPath, () => {
    return HttpResponse.json({ data: reportData }, { status: 201 });
  })
);

describe('useCopyReport', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useCopyReport(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.data).toBeUndefined();

    act(() => result.current.mutate({ id: '0' })); // the id doesn't matter

    await waitFor(() => result.current.isSuccess);
    expect(result.current.data?.data).toEqual(reportData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiCopyPath, () => HttpResponse.json(null, { status: 500 }))
    );

    const { result } = renderHook(() => useCopyReport(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.error).toBeNull();

    act(() => result.current.mutate({ id: '0' }));

    await waitFor(() => result.current.isError);
    expect(result.current.error).toBeDefined();
  });
});
