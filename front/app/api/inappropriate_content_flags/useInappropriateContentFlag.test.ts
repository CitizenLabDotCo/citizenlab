import { renderHook } from '@testing-library/react-hooks';

import useInappropriateContentFlag from './useInappropriateContentFlag';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { IInappropriateContentFlagData } from './types';

const apiPath = '*inappropriate_content_flags/:id';

const data: IInappropriateContentFlagData = {
  id: '1',
  type: 'inappropriate_content_flag',
  attributes: {
    reason_code: 'inappropriate',
    deleted_at: '2021-02-11T15:50:06.000Z',
    toxicity_label: 'insult',
  },
  relationships: {
    flaggable: {
      data: {
        id: '1',
        type: 'idea',
      },
    },
  },
};

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data }));
  })
);

describe('useInappropriateContentFlag', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useInappropriateContentFlag('1'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(data);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useInappropriateContentFlag('1'),
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
