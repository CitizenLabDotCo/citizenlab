import { renderHook, act } from '@testing-library/react-hooks';

import useAddInitiative from './useAddInitiative';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { initiativesData } from './__mocks__/_mockServer';

const apiPath = '*initiatives';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: initiativesData[0] }));
  })
);

describe('useAddInitiative', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddInitiative(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        publication_status: 'published',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(initiativesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddInitiative(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        publication_status: 'published',
        title_multiloc: {
          en: 'test',
        },
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
