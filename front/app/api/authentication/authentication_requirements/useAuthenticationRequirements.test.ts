import { renderHook, waitFor } from 'utils/testUtils/rtl';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import endpoints, {
  phaseResponse,
  ideaResponse,
} from './__mocks__/_mockServer';
import useAuthenticationRequirements from './useAuthenticationRequirements';

const server = setupServer(
  endpoints['GET phases/:phaseId/permissions/posting_idea/requirements'],
  endpoints['GET ideas/:ideaId/permissions/commenting_idea/requirements']
);

describe('useAuthenticationRequirements', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns phase data correctly', async () => {
    const context = {
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    } as const;

    const { result } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(phaseResponse);
  });

  it('returns idea data correctly', async () => {
    const context = {
      type: 'idea',
      action: 'commenting_idea',
      id: '789',
    } as const;

    const { result } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(ideaResponse);
  });
});
