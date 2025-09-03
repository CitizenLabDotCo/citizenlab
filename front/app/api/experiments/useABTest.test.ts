import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { experimentsData } from './__mocks__/useExperiments';
import useABTest from './useABTest';

jest.mock('api/me/useAuthUser');

const apiPath = '*experiments';
const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: experimentsData[0] }, { status: 200 });
  })
);

describe('useABTest', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('works when there is a user', async () => {
    const { result } = renderHook(
      () =>
        useABTest({
          experiment: 'Button location',
          treatments: ['Left', 'Right'],
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    // This is a pseudo-random outcome based on the id of the user
    // in the useAuthUser mock.
    await waitFor(() => expect(result.current.treatment).toBe('Right'));
  });
});
