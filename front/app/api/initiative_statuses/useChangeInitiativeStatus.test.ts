import { renderHook, act } from '@testing-library/react-hooks';

import useChangeInitiativeStatus from './useChangeInitiativeStatus';
import { initiativeStatusesData } from './__mocks__/useInitiativeStatuses';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/initiatives/:initiativeId/initiative_status_changes';
const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: initiativeStatusesData[0] }));
  })
);

describe('useChangeInitiativeStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useChangeInitiativeStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'id',
        feedbackId: 'feedbackId',
        statusId: 'statusId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(initiativeStatusesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useChangeInitiativeStatus(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      act(() => {
        result.current.mutate({
          initiativeId: 'id',
          feedbackId: 'feedbackId',
          statusId: 'statusId',
        });
      });
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
