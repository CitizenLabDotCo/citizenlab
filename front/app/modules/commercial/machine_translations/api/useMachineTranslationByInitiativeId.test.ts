import { renderHook } from '@testing-library/react-hooks';

import useMachineTranslationByInitiativeId from './useMachineTranslationByInitiativeId';
import { machineTranslation } from './__mocks__/machineTranslation';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*initiatives/:initiativeId/machine_translation';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: machineTranslation }));
  })
);

describe('useMachineTranslationByInitiativeId', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useMachineTranslationByInitiativeId({
          initiativeId: 'id',
          machine_translation: {
            locale_to: 'nl-BE',
            attribute_name: 'body_multiloc',
          },
          enabled: true,
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(machineTranslation);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useMachineTranslationByInitiativeId({
          initiativeId: 'id',
          machine_translation: {
            locale_to: 'nl-BE',
            attribute_name: 'body_multiloc',
          },
          enabled: true,
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
