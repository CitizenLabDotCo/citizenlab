import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { customPagesData } from './__mocks__/useCustomPages';
import useAddCustomPage from './useAddCustomPage';

const apiPath = '*static_pages';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: customPagesData[0] }, { status: 200 });
  })
);

describe('useAddCustomPage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddCustomPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(customPagesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddCustomPage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'test',
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
