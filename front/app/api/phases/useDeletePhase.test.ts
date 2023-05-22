import { renderHook, act } from '@testing-library/react-hooks';

import useDeletePhase from './useDeletePhase';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*phases/:phaseId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeletePhase', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeletePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        projectId: 'projectId',
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

    const { result, waitFor } = renderHook(() => useDeletePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        projectId: 'projectId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
