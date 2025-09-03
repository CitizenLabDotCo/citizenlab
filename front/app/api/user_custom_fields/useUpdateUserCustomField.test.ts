import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { userCustomFieldsData } from './__mocks__/useUserCustomFields';
import useUpdateUserCustomField from './useUpdateUserCustomField';

const apiPath = '*/users/custom_fields/:customFieldId';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(
      { data: userCustomFieldsData[0] },
      { status: 200 }
    );
  })
);

describe('useUpdateUserCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdateUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useUpdateUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
