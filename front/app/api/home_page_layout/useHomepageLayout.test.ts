import { renderHook } from '@testing-library/react-hooks';

import useHomepageLayout from './useHomepageLayout';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { homepageBuilderLayoutData } from './__mocks__/homepageLayout';

const apiPath = '*home_pages/content_builder_layouts/homepage';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: homepageBuilderLayoutData }));
  })
);

describe('useHomepageLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const spy = jest.spyOn(global, 'fetch');
    const { result, waitFor } = renderHook(() => useHomepageLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(homepageBuilderLayoutData);
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useHomepageLayout(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
