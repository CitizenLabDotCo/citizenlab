import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { permissionsData } from './__mocks__/usePermissions';
import useUpdatePermission from './useUpdatePermission';

const apiPath = '*permissions/:action';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: permissionsData[0] }));
  })
);

describe('useUpdatePermission', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdatePermission(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        global_custom_fields: false,
        group_ids: [],
        id: '7ba05225-d56b-4a9b-848c-0c93560792ae',
        permitted_by: 'admins_moderators',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(permissionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdatePermission(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        global_custom_fields: false,
        group_ids: [],
        id: '7ba05225-d56b-4a9b-848c-0c93560792ae',
        permitted_by: 'admins_moderators',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
