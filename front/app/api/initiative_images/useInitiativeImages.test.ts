import { renderHook } from '@testing-library/react-hooks';

import useInitiativeImages from './useInitiativeImages';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { initiativeImagesData } from './__mocks__/_mockServer';

const apiPath = '*initiatives/:initiativeId/images';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: initiativeImagesData }));
  })
);

describe('useInitiativeImages', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useInitiativeImages('initiativeId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(initiativeImagesData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInitiativeImages('initiativeId'),
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
