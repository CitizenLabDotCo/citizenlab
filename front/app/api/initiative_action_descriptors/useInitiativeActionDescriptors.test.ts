import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useInitiativeActionDescriptors from './useInitiativeActionDescriptors';

const apiPath = '*action_descriptors/initiatives';

const initiativesActionDescriptorsData = {
  data: {
    type: 'initiatives',
    attributes: {
      posting_initiative: {
        disabled_reason: 'user_not_signed_in',
        enabled: false,
      },
      commenting_initiative: {
        disabled_reason: 'user_not_signed_in',
        enabled: false,
      },
      reacting_initiative: {
        disabled_reason: 'user_not_signed_in',
        enabled: false,
      },
      comment_reacting_initiative: {
        disabled_reason: 'user_not_signed_in',
        enabled: false,
      },
      cancelling_initiative_reactions: {
        disabled_reason: 'user_not_signed_in',
        enabled: false,
      },
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: initiativesActionDescriptorsData })
    );
  })
);

describe('useInitiativeActionDescriptors', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useInitiativeActionDescriptors(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(initiativesActionDescriptorsData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInitiativeActionDescriptors(),
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
