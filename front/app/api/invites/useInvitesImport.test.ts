import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useInvitesImport from './useInvitesImport';

const importId = '123';
const apiPath = `*/invites_imports/${importId}`;
const mockResponse = {
  data: {
    id: importId,
    type: 'invite_import',
    attributes: {
      completed_at: '2024-01-01T00:00:00Z',
      job_type: 'bulk_create',
      result: {
        newly_added_admins_number: 2,
        newly_added_moderators_number: 1,
      },
    },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(mockResponse, { status: 200 });
  })
);

describe('useInvitesImport', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () => useInvitesImport({ importId }, { enabled: true }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useInvitesImport({ importId }, { enabled: true }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
