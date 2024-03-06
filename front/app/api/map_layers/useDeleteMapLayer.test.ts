import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDeleteMapLayer from './useDeleteMapLayer';
const apiPath = '*/projects/:projectId/map_config/layers/:id';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteMapLayer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'id', projectId: 'projectId' });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteMapLayer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ id: 'id', projectId: 'projectId' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
