import { renderHook, act } from '@testing-library/react-hooks';

import useReorderUserCustomField from './useReorderUserCustomField';
import { userCustomFieldsData } from './__mocks__/useUserCustomFields';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/users/custom_fields/:customFieldId/reorder';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: userCustomFieldsData[0] }));
  })
);

describe('useReorderUserCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useReorderUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        customFieldId: 'id',
        ordering: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useReorderUserCustomField(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        customFieldId: 'id',

        ordering: 1,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
