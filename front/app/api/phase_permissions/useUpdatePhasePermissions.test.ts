import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IPhasePermissionData } from './types';
import useUpdatePhasePermission from './useUpdatePhasePermission';

export const data: IPhasePermissionData = {
  id: '5d14ece5feb0',
  type: 'permission',
  attributes: {
    action: 'commenting_idea',
    permitted_by: 'everyone_confirmed_email',
    created_at: '2023-03-28T12:29:20.848Z',
    updated_at: '2023-03-28T13:15:59.410Z',
    global_custom_fields: false,
    verification_enabled: false,
    verification_expiry: null,
    access_denied_explanation_multiloc: {},
    everyone_tracking_enabled: false,
  },
  relationships: {
    permission_scope: {
      data: {
        id: 'fc251de04cb7',
        type: 'phase',
      },
    },
    groups: {
      data: [],
    },
  },
};

const apiPath = '*phases/:phaseId/permissions/:action';
const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data }, { status: 200 });
  })
);

describe('useUpdatePhasePermission', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useUpdatePhasePermission(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        permissionId: '5d14ece5feb0',
        phaseId: 'fc251de04cb7',
        action: 'commenting_idea',
        permission: {
          permitted_by: 'users',
          group_ids: [],
        },
      });
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

    const { result } = renderHook(() => useUpdatePhasePermission(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        permissionId: '5d14ece5feb0',
        phaseId: 'fc251de04cb7',
        action: 'commenting_idea',
        permission: {
          permitted_by: 'users',
          group_ids: [],
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
