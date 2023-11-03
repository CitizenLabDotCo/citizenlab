import { renderHook } from '@testing-library/react-hooks';

import useIdeaImage from './useIdeaImage';
import endpoints, {
  apiPathImage,
  ideaImagesData,
} from './__mocks__/_mockServer';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const server = setupServer(endpoints['GET ideas/:ideaId/images/:imageId']);

describe('useIdeaImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useIdeaImage('ideaId', 'imageId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideaImagesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPathImage, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useIdeaImage('ideaId', 'imageId'),
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
