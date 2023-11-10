import { renderHook } from '@testing-library/react-hooks';

import useInitiativeImage from './useInitiativeImage';

import { setupServer } from 'msw/node';
import { rest } from 'msw';
import endpoints, {
  initiativeImagesData,
  apiPath,
} from './__mocks__/_mockServer';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const server = setupServer(
  endpoints['GET initiatives/:initiativeId/images/:imageId']
);

describe('useInitiativeImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useInitiativeImage('initiativeId', 'imageId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(initiativeImagesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInitiativeImage('initiativeId', 'imageId'),
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
