import { setupServer } from 'msw/node';
import { rest } from 'msw';

import { IMentionData } from './types';
import getMentions from './getMentions';
import { waitFor } from 'utils/testUtils/rtl';
import { queryClient } from 'utils/cl-react-query/queryClient';

const mentionsData: IMentionData[] = [
  {
    id: '1',
    type: 'user',
    attributes: {
      first_name: 'John',
      last_name: 'Doe',
      slug: 'john-doe',
      avatar: {
        small: null,
        medium: null,
        large: null,
      },
    },
  },
  {
    id: '2',
    type: 'user',
    attributes: {
      first_name: 'Jane',
      last_name: 'Doe',
      slug: 'jane-doe',
      avatar: {
        small: null,
        medium: null,
        large: null,
      },
    },
  },
];

const apiPath = '*mentions/users';

const server = setupServer();

describe('getMentions', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  afterEach(() => queryClient.clear());

  it('returns data correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res.once(
          ctx.status(200),
          ctx.json({ data: { data: mentionsData } })
        );
      })
    );

    const result = await getMentions({ mention: 'test' });
    await waitFor(() => expect(result.data).toEqual({ data: mentionsData }));
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res.once(ctx.status(500), ctx.json({ error: 'error' }));
      })
    );

    let thrownError = {};

    try {
      await getMentions({ mention: 'test' });
    } catch (error) {
      thrownError = error;
    }

    await waitFor(() => expect(thrownError).toEqual({ error: 'error' }));
  });
});
