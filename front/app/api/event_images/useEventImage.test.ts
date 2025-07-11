import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { eventData } from 'api/events/__mocks__/useEvent';
import { IEventData } from 'api/events/types';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { eventImageData } from './__mocks__/useEventImage';
import useEventImage from './useEventImage';

const apiPath = '*/events/:eventId/images/:imageId';

// Create event data with image relationship
const eventWithImages: IEventData = {
  ...eventData,
  relationships: {
    ...eventData.relationships,
    event_images: {
      data: [
        {
          id: eventImageData.id,
          type: 'image',
        },
      ],
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: eventImageData }, { status: 200 });
  })
);

describe('useEventImage', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useEventImage(eventWithImages), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(eventImageData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useEventImage(eventWithImages), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
