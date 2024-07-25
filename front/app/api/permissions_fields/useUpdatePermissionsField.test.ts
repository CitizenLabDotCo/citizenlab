import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import useUpdatePermissionsField from 'api/permissions_fields/useUpdatePermissionsField';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const data = {
  id: 'customFieldId1',
  type: 'permissions_field',
  attributes: {
    required: true,
    created_at: 'created-at',
    updated_at: 'updated-at',
  },
  relationships: {
    permission: {
      data: {
        id: 'globalCustomFieldId1',
        type: 'permission',
      },
    },
    custom_field: {
      data: {
        id: 'globalCustomFieldId1',
        type: 'custom_field',
      },
    },
  },
};

const apiPath = '*/permissions_fields/:id';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useUpdatePermissionsField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useUpdatePermissionsField({
          action: 'taking_poll',
          phaseId: '1',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({ id: 'customFieldId1', required: true });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useUpdatePermissionsField({
          action: 'taking_poll',
          phaseId: '1',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({ id: '5d14ece5feb0', required: true });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
