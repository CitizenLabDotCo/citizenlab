import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { permissionsCustomFieldsData } from './__mocks__/usePermissionsCustomFields';
import useAddPermissionsCustomField from './useAddPermissionsCustomField';

const apiPath = '*/permissions/:action/permissions_custom_fields';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: permissionsCustomFieldsData[0] },
      { status: 200 }
    );
  })
);

describe('useAddPermissionsCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () =>
        useAddPermissionsCustomField({
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
    expect(result.current.data?.data).toEqual(permissionsCustomFieldsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useAddPermissionsCustomField({
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
