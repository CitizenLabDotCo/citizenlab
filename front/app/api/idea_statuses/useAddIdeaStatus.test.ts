import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ideaStatusesData } from './__mocks__/_mockServer';
import useAddIdeaStatus from './useAddIdeaStatus';

const apiPath = '*idea_statuses';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: ideaStatusesData[0] }, { status: 200 });
  })
);

describe('useAddIdeaStatus', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddIdeaStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'test',
        },
        color: 'red',
        participation_method: 'ideation',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideaStatusesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(() => useAddIdeaStatus(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        title_multiloc: {
          en: 'test',
        },
        color: 'red',
        participation_method: 'ideation',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
