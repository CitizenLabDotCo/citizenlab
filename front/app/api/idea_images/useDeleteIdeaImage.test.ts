import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteIdeaImage from './useDeleteIdeaImage';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
const apiPath = '*ideas/:ideaId/images/:imageId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteIdeaImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        imageId: 'imageId',
      });
    });

    await waitFor(() => expect(result.current.data).not.toBe(undefined));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        imageId: 'imageId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
