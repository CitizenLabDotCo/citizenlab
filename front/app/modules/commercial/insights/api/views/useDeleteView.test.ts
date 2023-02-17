import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteView from './useDeleteView';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const server = setupServer(
  rest.delete('*insights/views/:id', (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteView', () => {
  beforeAll(() => server.listen({ onUnhandledRequest: 'error' }));
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteView(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete('*insights/views/:id', (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteView(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('id');
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
