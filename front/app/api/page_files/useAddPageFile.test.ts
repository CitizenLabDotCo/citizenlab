import { renderHook, act } from '@testing-library/react-hooks';

import useAddPageFile from './useAddPageFile';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { pageFilesData } from './__mocks__/usePageFiles';

const apiPath = '*static_pages/:pageId/files';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: pageFilesData[0] }));
  })
);

describe('useAddPageFile', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddPageFile(), {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddPageFile(), {
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
