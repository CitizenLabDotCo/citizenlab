import { renderHook, act } from '@testing-library/react-hooks';

import useAddInitiativeOfficialFeedback from './useAddInitiativeOfficialFeedback';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { data } from './useInitiativeOfficialFeedback.test';

const apiPath = '*/initiatives/:initiativeId/official_feedback';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: data[0] }));
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
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
