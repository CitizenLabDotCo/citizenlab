import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { invitesData } from './__mocks__/useInvites';
import useBulkInviteEmails from './useBulkInviteEmails';

const apiPath = '*/invites/bulk_create';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: invitesData }, { status: 200 });
  })
);

describe('useBulkInviteEmails', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useBulkInviteEmails(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        emails: ['email@example.com'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(invitesData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useBulkInviteEmails(), {
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
