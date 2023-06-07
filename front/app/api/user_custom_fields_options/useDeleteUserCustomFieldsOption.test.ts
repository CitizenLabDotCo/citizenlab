import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteUserCustomFieldsOption from './useDeleteUserCustomFieldsOption';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/poll_options/:optionId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteUserCustomFieldsOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useDeleteUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        customFieldId: 'customFieldId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useDeleteUserCustomFieldsOption(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        customFieldId: 'customFieldId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
