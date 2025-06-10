import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useAddVolunteer from './useAddVolunteer';

const volunteerData = {
  id: '1',
  type: 'volunteer',
};

const apiPath = '*causes/:causeId/volunteers';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: volunteerData }, { status: 200 });
  })
);

describe('useAddVolunteer', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddVolunteer(), {
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddVolunteer(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate('1');
    });
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
