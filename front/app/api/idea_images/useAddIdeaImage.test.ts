import { renderHook, act } from '@testing-library/react-hooks';

import useAddIdeaImage from './useAddIdeaImage';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { ideaImagesData } from './__mocks__/ideaImages';

const apiPath = '*ideas/:ideaId/images';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaImagesData[0] }));
  })
);

describe('useAddIdeaImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        image: {
          image: 'testbase64',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideaImagesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddIdeaImage(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        ideaId: 'ideaId',
        image: {
          image: 'testbase64',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
