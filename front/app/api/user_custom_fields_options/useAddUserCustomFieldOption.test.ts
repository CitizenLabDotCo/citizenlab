import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { userCustomFieldsOptionsData } from './__mocks__/useUserCustomFieldsOptions';
import useAddUserCustomFieldOption from './useAddUserCustomFieldOption';

const apiPath = '*/users/custom_fields/:customFieldId/custom_field_options';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: userCustomFieldsOptionsData },
      { status: 200 }
    );
  })
);

describe('useAddUserCustomFieldOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddUserCustomFieldOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsOptionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddUserCustomFieldOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
