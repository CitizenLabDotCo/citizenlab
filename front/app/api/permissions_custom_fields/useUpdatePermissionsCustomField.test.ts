import { renderHook, act } from '@testing-library/react-hooks';

import useUpdatePermissionsCustomField from './useUpdatePermissionsCustomField';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const data = {
  id: 'customFieldId1',
  type: 'permissions_custom_field',
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

const apiPath = '*/permissions_custom_fields/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useUpdatePermissionsCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useUpdatePermissionsCustomField({
          action: 'taking_poll',
          projectId: '1',
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
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useUpdatePermissionsCustomField({
          action: 'taking_poll',
          projectId: '1',
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
