import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useBulkInviteCountNewSeatsEmail from './useBulkInviteCountNewSeatsEmails';

const apiPath = '*/invites/count_new_seats';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useBulkInviteCountNewSeatsEmail', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useBulkInviteCountNewSeatsEmail(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        emails: ['email@example.com'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useBulkInviteCountNewSeatsEmail(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        emails: ['email@example.com'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
