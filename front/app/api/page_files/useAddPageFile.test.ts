import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { pageFilesData } from './__mocks__/usePageFiles';
import useAddPageFile from './useAddPageFile';

const apiPath = '*static_pages/:pageId/files';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: pageFilesData[0] }, { status: 200 });
  })
);

describe('useAddPageFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddPageFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        pageId: 'pageId',
        file: {
          name: 'file name',
          file: 'test file',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(pageFilesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddPageFile(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        pageId: 'pageId',
        file: {
          name: 'file name',
          file: 'test file',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
