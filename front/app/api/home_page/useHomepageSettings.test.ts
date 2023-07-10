import { renderHook } from '@testing-library/react-hooks';

import useHomepageSettings from './useHomepageSettings';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { mockHomepageSettingsData } from './__mocks__/useHomepageSettings';

jest.unmock('./useHomepageSettings');

const server = setupServer(
  rest.get('*home_page', (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: mockHomepageSettingsData }));
  })
);

describe('useHomepageSettings', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useHomepageSettings(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(mockHomepageSettingsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get('*home_page', (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useHomepageSettings(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
