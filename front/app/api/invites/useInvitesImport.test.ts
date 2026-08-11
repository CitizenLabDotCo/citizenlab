import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import appConfigurationKeys from 'api/app_configuration/keys';
import seatsKeys from 'api/seats/keys';

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

const respondWith = (attributes: Record<string, unknown>) =>
  server.use(
    http.get(apiPath, () =>
      HttpResponse.json(
        {
          data: {
            ...mockResponse.data,
            attributes: { ...mockResponse.data.attributes, ...attributes },
          },
        },
        { status: 200 }
      )
    )
  );

// The shared wrapper keeps its client to itself, and these assertions are about
// what the hook does to that client.
const createSpyingWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return {
    invalidateQueries: jest.spyOn(queryClient, 'invalidateQueries'),
    wrapper: ({ children }: { children: React.ReactNode }) =>
      React.createElement(
        QueryClientProvider,
        { client: queryClient },
        children
      ),
  };
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
      () => useInvitesImport({ importId, enabled: true }),
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
      () => useInvitesImport({ importId, enabled: true }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  // Seat counts change when invites are created, so the views showing them are
  // refreshed here rather than in the component waiting on the job.
  describe('refreshing the seat counts', () => {
    const renderAndSettle = async () => {
      const { wrapper, invalidateQueries } = createSpyingWrapper();
      const { result } = renderHook(
        () => useInvitesImport({ importId, enabled: true }),
        { wrapper }
      );

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      return invalidateQueries;
    };

    const invalidatedKeys = (invalidateQueries: jest.SpyInstance) =>
      invalidateQueries.mock.calls.map(([args]) => args.queryKey);

    it('refreshes them once a creation job completes', async () => {
      const invalidateQueries = await renderAndSettle();

      expect(invalidatedKeys(invalidateQueries)).toEqual(
        expect.arrayContaining([seatsKeys.items(), appConfigurationKeys.all()])
      );
    });

    // This runs on every poll, so an ungated version would fire every 5s.
    it('leaves them alone while the job is still running', async () => {
      respondWith({ completed_at: null, result: {} });

      expect(await renderAndSettle()).not.toHaveBeenCalled();
    });

    it('leaves them alone for a seat count job', async () => {
      respondWith({ job_type: 'count_new_seats' });

      expect(await renderAndSettle()).not.toHaveBeenCalled();
    });

    it('leaves them alone when the creation failed', async () => {
      respondWith({ result: { errors: [{ error: 'no_invites_specified' }] } });

      expect(await renderAndSettle()).not.toHaveBeenCalled();
    });
  });
});
