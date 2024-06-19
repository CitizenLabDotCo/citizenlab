import { renderHook, act } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useAddInitiativeOfficialFeedback from './useAddInitiativeOfficialFeedback';
import { data } from './useInitiativeOfficialFeedback.test';

const apiPath = '*/initiatives/:initiativeId/official_feedback';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: data[0] }, { status: 200 });
  })
);

describe('useAddInitiativeOfficialFeedback', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useAddInitiativeOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        body_multiloc: {
          en: 'test',
        },
        author_multiloc: {
          en: 'authod',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(data[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () => useAddInitiativeOfficialFeedback(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        initiativeId: 'initiativeId',
        body_multiloc: {
          en: 'test',
        },
        author_multiloc: {
          en: 'authod',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
