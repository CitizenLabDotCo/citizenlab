import { renderHook, act } from '@testing-library/react-hooks';

import useAddPermissionsCustomField from './useAddPermissionsCustomField';
import { permissionsCustomFieldsData } from './__mocks__/usePermissionsCustomFields';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/permissions/:action/permissions_custom_fields';
const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: permissionsCustomFieldsData[0] })
    );
  })
);

describe('useAddPermissionsCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
