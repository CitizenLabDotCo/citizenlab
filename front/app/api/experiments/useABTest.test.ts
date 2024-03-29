import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { experimentsData } from './__mocks__/useExperiments';
import useABTest from './useABTest';

jest.mock('api/me/useAuthUser');

const apiPath = '*experiments';
const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: experimentsData[0] }));
  })
);

describe('useABTest', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('works when there is a user', async () => {
    const { result, waitFor } = renderHook(
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
