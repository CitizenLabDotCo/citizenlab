import useProjects from './useProjects';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import endpoints, { projects, apiPathAll } from './__mocks__/_mockServer';

const server = setupServer(endpoints['GET projects']);

describe('useProjects', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useProjects({ pageNumber: 1, publicationStatuses: ['published'] }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(projects.data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPathAll, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useProjects({ pageNumber: 1, publicationStatuses: ['published'] }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
