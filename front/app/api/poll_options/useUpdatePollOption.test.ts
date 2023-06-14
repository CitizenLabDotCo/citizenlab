import { renderHook, act } from '@testing-library/react-hooks';

import useUpdatePollOption from './useUpdatePollOption';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { pollOptionsData } from './__mocks__/usePollOptions';

const apiPath = '*/poll_options/:optionId';

const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: pollOptionsData[0] }));
  })
);

describe('useUpdatePollOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdatePollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        questionId: 'questionId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(pollOptionsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdatePollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        questionId: 'questionId',
        title_multiloc: { en: 'mock title' },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
