import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useBulkInviteCountNewSeatsXLSX from './useBulkInviteCountNewSeatsXLSX';

const apiPath = '*/invites/count_new_seats_xlsx';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useBulkInviteCountNewSeatsXLSX', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useBulkInviteCountNewSeatsXLSX(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        xlsx: 'xlsx string',
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

    const { result } = renderHook(() => useBulkInviteCountNewSeatsXLSX(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        xlsx: 'xlsx string',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
