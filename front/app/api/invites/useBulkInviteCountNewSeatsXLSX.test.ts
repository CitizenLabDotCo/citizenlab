import { renderHook, act } from '@testing-library/react-hooks';

import useBulkInviteCountNewSeatsXLSX from './useBulkInviteCountNewSeatsXLSX';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/invites/count_new_seats_xlsx';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useBulkInviteCountNewSeatsXLSX', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useBulkInviteCountNewSeatsXLSX(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        xlsx: 'xlsx string',
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
      () => useBulkInviteCountNewSeatsXLSX(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        xlsx: 'xlsx string',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
