import { renderHook, act } from '@testing-library/react-hooks';

import useUpdateInitiativeStatus from './useUpdateInitiativeStatus';
import { initiativeStatusesData } from './__mocks__/_mockServer';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*/initiatives/:initiativeId/initiative_status_changes';
const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: initiativeStatusesData[0] }));
  })
);

describe('useUpdateInitiativeStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdateInitiativeStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'id',
        official_feedback_id: 'feedbackId',
        initiative_status_id: 'statusId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(initiativeStatusesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdateInitiativeStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        initiativeId: 'id',
        official_feedback_id: 'feedbackId',
        initiative_status_id: 'statusId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
