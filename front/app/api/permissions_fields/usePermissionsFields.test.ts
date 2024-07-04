import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import usePermissionsFields from 'api/permissions_fields/usePermissionsFields';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { permissionsFieldsData } from './__mocks__/usePermissionsFields';

const apiPath = '*/permissions/:action/permissions_fields';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: permissionsFieldsData }, { status: 200 });
  })
);

describe('usePermissionsFields', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        usePermissionsFields({
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
    expect(result.current.data?.data).toEqual(permissionsFieldsData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        usePermissionsFields({
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
