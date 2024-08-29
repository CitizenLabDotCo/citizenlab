import { renderHook } from '@testing-library/react-hooks';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import useInitiativeAllowedTransitions from './useInitiativeAllowedTransitions';

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
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: initiativeAllowedTransitionsData },
      { status: 200 }
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
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
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
