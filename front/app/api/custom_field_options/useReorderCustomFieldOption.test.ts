import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { customFieldOptionsData } from './__mocks__/useCustomFieldOptions';
import useReorderCustomFieldOption from './useReorderCustomFieldOption';

const apiPath = '*/custom_field_options/:optionId/reorder';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(
      { data: customFieldOptionsData[0] },
      { status: 200 }
    );
  })
);

describe('useReorderCustomFieldOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useReorderCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'id',
        ordering: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(customFieldOptionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useReorderCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        optionId: 'id',
        ordering: 1,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
