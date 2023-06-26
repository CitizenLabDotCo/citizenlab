import { renderHook, act } from '@testing-library/react-hooks';

import useReorderUserCustomFieldsOption from './useReorderUserCustomFieldsOption';
import { userCustomFieldsOptionsData } from './__mocks__/useUserCustomFieldsOptions';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath =
  '*/users/custom_fields/:customFieldId/custom_field_options/:optionId/reorder';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: userCustomFieldsOptionsData[0] })
    );
  })
);

describe('useReorderUserCustomFieldsOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useReorderUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        customFieldId: 'id',
        optionId: 'id',
        ordering: 1,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsOptionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useReorderUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );
    act(() => {
      result.current.mutate({
        customFieldId: 'id',
        optionId: 'id',
        ordering: 1,
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
