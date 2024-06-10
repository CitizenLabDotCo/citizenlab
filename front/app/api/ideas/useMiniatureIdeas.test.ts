import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import endpoints, {
  apiPathMiniIdeas,
  miniIdeaData,
} from './__mocks__/_mockServer';
import useMiniatureIdeas from './useMiniatureIdeas';

const server = setupServer(endpoints['GET ideas/mini']);

describe('useMiniatureIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useMiniatureIdeas({
          'page[number]': 1,
          sort: 'random',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(miniIdeaData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPathMiniIdeas, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useMiniatureIdeas({
          'page[number]': 1,
          sort: 'random',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
