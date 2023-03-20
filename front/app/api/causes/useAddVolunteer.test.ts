import { renderHook, act } from '@testing-library/react-hooks';

import useAddVolunteer from './useAddVolunteer';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const volunteerData = {
  id: '1',
  type: 'volunteer',
};

const apiPath = '*causes/:causeId/volunteers';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: volunteerData }));
  })
);

describe('useAddVolunteer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(volunteerData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
