import { renderHook, act } from '@testing-library/react-hooks';

import useBulkInviteCountNewSeatsEmail from './useBulkInviteCountNewSeatsEmails';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/invites/count_new_seats';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useBulkInviteCountNewSeatsEmail', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useBulkInviteCountNewSeatsEmail(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        emails: ['email@example.com'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useBulkInviteCountNewSeatsEmail(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        emails: ['email@example.com'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
