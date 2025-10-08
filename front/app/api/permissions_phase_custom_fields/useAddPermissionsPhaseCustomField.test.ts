import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { permissionsPhaseCustomFieldsData } from './__mocks__/usePermissionsPhaseCustomFields';
import useAddPermissionsPhaseCustomField from './useAddPermissionsPhaseCustomField';

const apiPath = '*/permissions/:action/permissions_custom_fields';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: permissionsPhaseCustomFieldsData[0] },
      { status: 200 }
    );
  })
);

describe('useAddPermissionsPhaseCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () =>
        useAddPermissionsPhaseCustomField({
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
    expect(result.current.data?.data).toEqual(
      permissionsPhaseCustomFieldsData[0]
    );
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useAddPermissionsPhaseCustomField({
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
