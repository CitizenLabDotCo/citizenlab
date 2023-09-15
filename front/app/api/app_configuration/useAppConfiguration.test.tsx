import { renderHook } from '@testing-library/react-hooks';

import useAppConfiguration from './useAppConfiguration';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import mockServer, { getAppConfigurationData } from './__mocks__/_mockServer';

jest.unmock('./useAppConfiguration');

const server = setupServer(...mockServer);

describe('useAppConfiguration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(getAppConfigurationData());
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get('*app_configuration', (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAppConfiguration(), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
