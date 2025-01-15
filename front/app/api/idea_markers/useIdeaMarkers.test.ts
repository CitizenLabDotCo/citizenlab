import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useIdeaMarkers from './useIdeaMarkers';

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
  http.get(apiPath, () => {
    return HttpResponse.json({ data: ideasMarkersData }, { status: 200 });
  })
);

describe('useIdeaMarkers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
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
