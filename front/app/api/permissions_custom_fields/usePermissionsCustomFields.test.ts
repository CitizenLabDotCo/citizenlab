import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import usePermissionsCustomFields from 'api/permissions_custom_fields/usePermissionsCustomFields';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { permissionsCustomFieldsData } from './__mocks__/usePermissionsCustomFields';

const apiPath = '*/permissions/:action/permissions_custom_fields';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: permissionsCustomFieldsData },
      { status: 200 }
    );
  })
);

describe('usePermissionsCustomFields', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        usePermissionsCustomFields({
          projectId: 'dummyId',
          action: 'taking_survey',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(permissionsCustomFieldsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        usePermissionsCustomFields({
          projectId: 'dummyId',
          action: 'taking_survey',
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
