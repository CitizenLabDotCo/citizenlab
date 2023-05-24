import { renderHook } from '@testing-library/react-hooks';

import usePhases from './usePhases';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { phasesData } from './__mocks__/usePhases';

const apiPath = '*projects/:projectId/phases';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: phasesData }));
  })
);

describe('usePhases', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => usePhases('projectId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(phasesData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => usePhases('projectId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
