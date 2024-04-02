import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useDeletePollOption from './useDeletePollOption';

const apiPath = '*/poll_options/:optionId';

const server = setupServer(
  rest.delete(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200));
  })
);

describe('useDeletePollOption', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useDeletePollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        questionId: 'questionId',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.delete(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useDeletePollOption(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        optionId: 'optionId',
        questionId: 'questionId',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
