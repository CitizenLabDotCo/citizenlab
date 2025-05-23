import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { customFieldOptionsData } from './__mocks__/useCustomFieldOptions';
import useAddCustomFieldOption from './useAddCustomFieldOption';

const apiPath = '*/custom_fields/:customFieldId/custom_field_options';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: customFieldOptionsData }, { status: 200 });
  })
);

describe('useAddCustomFieldOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(customFieldOptionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddCustomFieldOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
