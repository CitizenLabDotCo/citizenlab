import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { data } from './useInitiativeOfficialFeedback.test';
import useUpdateInitiativeOfficialFeedback from './useUpdateInitiativeOfficialFeedback';

const apiPath = '*official_feedback/:id';

const server = setupServer(
  http.patch(apiPath, () => {
    return HttpResponse.json({ data: data[0] }, { status: 200 });
  })
);

describe('useUpdateInitiativeOfficialFeedback', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useUpdateInitiativeOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: {
          body_multiloc: {
            en: 'test',
          },
          author_multiloc: {
            en: 'authod',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.patch(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useUpdateInitiativeOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        id: 'id',
        requestBody: {
          body_multiloc: {
            en: 'test',
          },
          author_multiloc: {
            en: 'authod',
          },
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
