import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { IPCPermissionData } from './types';
import useUpdatePhasePermission from './useUpdatePhasePermission';

export const data: IPCPermissionData = {
  id: '5d14ece5feb0',
  type: 'permission',
  attributes: {
    action: 'commenting_idea',
    permitted_by: 'everyone_confirmed_email',
    created_at: '2023-03-28T12:29:20.848Z',
    updated_at: '2023-03-28T13:15:59.410Z',
    global_custom_fields: false,
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
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useUpdatePhasePermission', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useUpdatePhasePermission('fc251de04cb7'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useUpdatePhasePermission('fc251de04cb7'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
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
