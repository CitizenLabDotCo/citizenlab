import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { permissionsFieldsData } from './__mocks__/usePermissionsFields';
import useAddPermissionsField from './useAddPermissionsField';

const apiPath = '*/permissions/:action/permissions_fields';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: permissionsFieldsData[0] },
      { status: 200 }
    );
  })
);

describe('useAddPermissionsField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useAddPermissionsField({
          phaseId: 'phaseId1',
          action: 'taking_survey',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        custom_field_id: 'customFieldId1',
        required: false,
        action: 'taking_survey',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(permissionsFieldsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useAddPermissionsField({
          phaseId: 'phaseId1',
          action: 'taking_survey',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        custom_field_id: 'customFieldId1',
        required: false,
        action: 'taking_survey',
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
