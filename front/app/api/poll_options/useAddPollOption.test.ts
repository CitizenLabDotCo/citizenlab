import { renderHook, act } from '@testing-library/react-hooks';

import useAddPollOption from './useAddPollOption';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { pollOptionsData } from './__mocks__/usePollOptions';

const apiPath = '*/poll_questions/:questionId/poll_options';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: pollOptionsData }));
  })
);

describe('useAddPollOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddPollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(pollOptionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddPollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        questionId: 'questionId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
