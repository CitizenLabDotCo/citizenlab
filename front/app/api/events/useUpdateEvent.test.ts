import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { eventsData } from './__mocks__/useEvents';
import useUpdateEvent from './useUpdateEvent';

const apiPath = '*events/:id';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: eventsData[0] }));
  })
);

describe('useUpdateEvent', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateEvent(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        eventId: 'id',
        event: { title_multiloc: { en: 'name' } },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(eventsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateEvent(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        eventId: 'id',
        event: { title_multiloc: { en: 'name' } },
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
