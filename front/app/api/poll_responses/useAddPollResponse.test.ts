import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useAddPollResponse from './useAddPollResponse';

const apiPath = '*/phases/:phaseId/poll_responses';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(null, { status: 200 });
  })
);

describe('useAddPollResponse', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddPollResponse(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'id',
        optionIds: ['optionId'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddPollResponse(), {
      wrapper: createQueryClientWrapper(),
    });
    act(() => {
      result.current.mutate({
        phaseId: 'id',
        optionIds: ['optionId'],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
