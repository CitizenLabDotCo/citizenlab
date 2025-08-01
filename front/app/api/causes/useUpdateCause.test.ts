import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { causesData } from './__mocks__/useCauses';
import useUpdateCause from './useUpdateCause';

const apiPath = '*causes/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: causesData[0] }, { status: 200 });
  })
);

describe('useUpdateCause', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateCause(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: { title_multiloc: { en: 'name' } },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(causesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateCause(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: { title_multiloc: { en: 'name' } },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
