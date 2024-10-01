import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { userCustomFieldsOptionsData } from './__mocks__/useUserCustomFieldsOptions';
import useReorderUserCustomFieldsOption from './useReorderUserCustomFieldsOption';

const apiPath =
  '*/users/custom_fields/:customFieldId/custom_field_options/:optionId/reorder';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json(
      { data: userCustomFieldsOptionsData[0] },
      { status: 200 }
    );
  })
);

describe('useReorderUserCustomFieldsOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useReorderUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        customFieldId: 'id',
        optionId: 'id',
        ordering: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsOptionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useReorderUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        customFieldId: 'id',
        optionId: 'id',
        ordering: 1,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
