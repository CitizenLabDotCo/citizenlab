import { renderHook, act } from '@testing-library/react-hooks';

import useDeleteVolunteer from './useDeleteVolunteer';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*causes/:causeId/volunteers';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeleteVolunteer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeleteVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ causeId: '1', volunteerId: '2' });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeleteVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({ causeId: '1', volunteerId: '2' });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
