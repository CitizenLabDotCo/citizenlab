import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { machineTranslationData } from './__mocks__/useMachineTranslationByCommentId';
import useMachineTranslationByIdeaId from './useMachineTranslationByIdeaId';

const apiPath = '*ideas/:ideaId/machine_translation';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: machineTranslationData }, { status: 200 });
  })
);

describe('useMachineTranslationByIdeaId', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useMachineTranslationByIdeaId({
          ideaId: 'id',
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
    expect(result.current.data?.data).toEqual(machineTranslationData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result, waitFor } = renderHook(
      () =>
        useMachineTranslationByIdeaId({
          ideaId: 'id',
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
