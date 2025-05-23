import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { ideaData } from './__mocks__/_mockServer';
import useAddIdea from './useAddIdea';

const apiPath = '*ideas';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: ideaData[0] }, { status: 200 });
  })
);

describe('useAddIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        project_id: 'id',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideaData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        project_id: 'id',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
