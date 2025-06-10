import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useDeleteVolunteer from './useDeleteVolunteer';

const apiPath = '*causes/:causeId/volunteers';

const server = setupServer(
  http.delete(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useDeleteVolunteer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useDeleteVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ causeId: '1', volunteerId: '2' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
  it('returns error correctly', async () => {
    server.use(
      http.delete(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useDeleteVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ causeId: '1', volunteerId: '2' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
