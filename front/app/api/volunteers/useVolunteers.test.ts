import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { IVolunteerData } from './types';
import useVolunteers from './useVolunteers';

const apiPath = '*/phases/:phaseId/volunteers';

const volunteersData: IVolunteerData[] = [
  {
    id: '1',
    type: 'volunteer',
    attributes: {
      created_at: '2026-11-03T10:00:00.000Z',
      updated_at: '2026-11-03T10:00:00.000Z',
    },
    relationships: {
      cause: { data: { id: 'cause-1', type: 'cause' } },
      user: { data: { id: 'user-1', type: 'user' } },
    },
  },
];

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: volunteersData, included: [] },
      { status: 200 }
    );
  })
);

describe('useVolunteers', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useVolunteers({ phaseId: '1' }), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(volunteersData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useVolunteers({ phaseId: '1' }), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
