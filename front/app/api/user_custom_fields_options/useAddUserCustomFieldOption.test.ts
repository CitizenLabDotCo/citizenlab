import { renderHook, act } from '@testing-library/react-hooks';

import useAddUserCustomFieldOption from './useAddUserCustomFieldOption';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { userCustomFieldsOptionsData } from './__mocks__/useUserCustomFieldsOptions';

const apiPath = '*/users/custom_fields/:customFieldId/custom_field_options';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: userCustomFieldsOptionsData })
    );
  })
);

describe('useAddUserCustomFieldOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddUserCustomFieldOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(userCustomFieldsOptionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddUserCustomFieldOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        customFieldId: 'customFieldId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
