import { renderHook, act } from '@testing-library/react-hooks';

import useBulkInviteEmails from './useBulkInviteEmails';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { invitesData } from './__mocks__/useInvites';

const apiPath = '*/invites/bulk_create';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: invitesData }));
  })
);

describe('useBulkInviteEmails', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useBulkInviteEmails(), {
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useBulkInviteEmails(), {
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
