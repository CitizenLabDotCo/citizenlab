import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteUserCustomFields from './useDeleteUserCustomField';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/users/custom_fields/:customFieldId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteUserCustomFields', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteUserCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('customFieldId');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteUserCustomFields(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('customFieldId');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
