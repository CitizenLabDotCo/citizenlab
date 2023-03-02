import { renderHook } from '@testing-library/react-hooks';

import useInitiativeAllowedTransitions from './useInitiativeAllowedTransitions';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*initiatives/:id/allowed_transitions';

const initiativeAllowedTransitionsData = {
  data: {
    type: 'allowed_transitions',
    attributes: {
      'e1cd4119-bd0e-43ce-868b-97e510782a24': { feedback_required: true },
      '6c5d0ab5-1084-47a9-a451-bd84b6d40acd': { feedback_required: true },
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: initiativeAllowedTransitionsData })
    );
  })
);

describe('useInitiativeAllowedTransitions', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useInitiativeAllowedTransitions('id'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(initiativeAllowedTransitionsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInitiativeAllowedTransitions('id'),
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
