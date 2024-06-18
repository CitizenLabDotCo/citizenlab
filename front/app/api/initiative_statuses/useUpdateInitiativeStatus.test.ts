import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { initiativeStatusesData } from './__mocks__/_mockServer';
import useUpdateInitiativeStatus from './useUpdateInitiativeStatus';

const apiPath = '*/initiatives/:initiativeId/initiative_status_changes';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: initiativeStatusesData[0] },
      { status: 200 }
    );
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
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
