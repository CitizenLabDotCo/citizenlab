import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteCustomFieldOption from './useDeleteCustomFieldOption';

const apiPath = '*/custom_field_options/:optionId';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteCustomFieldOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeleteCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeleteCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
