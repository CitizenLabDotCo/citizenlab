import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { userCustomFieldsOptionsData } from './__mocks__/useUserCustomFieldsOptions';
import useUserCustomFieldsOption from './useUserCustomFieldsOption';

const apiPath =
  '*/users/custom_fields/:customFieldId/custom_field_options/:optionId';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: userCustomFieldsOptionsData[0] },
      { status: 200 }
    );
  })
);

describe('useUserCustomFieldsOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useUserCustomFieldsOption({
          customFieldId: 'customFieldId',
          optionId: 'optionId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(userCustomFieldsOptionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useUserCustomFieldsOption({
          customFieldId: 'customFieldId',
          optionId: 'optionId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
