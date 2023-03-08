import { renderHook, act } from '@testing-library/react-hooks';

import useAddEvent from './useAddEvent';
import { eventsData } from './__mocks__/useEvents';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/projects/:projectId/events';
const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: eventsData[0] }));
  })
);

describe('useAddEvent', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddEvent(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'id',
        event: {
          start_at: '2023-03-02T09:51:00.324Z',
          end_at: '2023-03-02T09:51:00.398Z',
          title_multiloc: {
            en: 'New Event',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddEvent(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        projectId: 'id',
        event: {
          start_at: '2023-03-02T09:51:00.324Z',
          end_at: '2023-03-02T09:51:00.398Z',
          title_multiloc: {
            en: 'New Event',
          },
        },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
