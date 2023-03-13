import { renderHook } from '@testing-library/react-hooks';

import useIdeaMarkers from './useIdeaMarkers';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*ideas/as_markers';

const ideasMarkersData = {
  data: [
    {
      id: 'ideaId',
      type: 'post_marker',
      attributes: {
        title_multiloc: {
          en: 'Idea title',
        },
        location_point_geojson: {
          type: 'Point',
          coordinates: [0, 0],
        },
        location_description: 'Location description',
      },
    },
  ],
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideasMarkersData }));
  })
);

describe('useIdeaMarkers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useIdeaMarkers({ projectIds: ['projectId'], topics: ['topicId'] }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideasMarkersData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useIdeaMarkers({ projectIds: ['projectId'], topics: ['topicId'] }),
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
