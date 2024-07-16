import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { queryClient } from 'utils/cl-react-query/queryClient';
import { waitFor } from 'utils/testUtils/rtl';

import getMentions from './getMentions';
import { IMentionData } from './types';

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
      http.get(
        apiPath,
        () => {
          return HttpResponse.json(
            { data: { data: mentionsData } },
            { status: 200 }
          );
        },
        { once: true }
      )
    );

    const result = await getMentions({ mention: 'test' });
    await waitFor(() => expect(result.data).toEqual({ data: mentionsData }));
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(
        apiPath,
        () => {
          return HttpResponse.json({ error: 'error' }, { status: 500 });
        },
        { once: true }
      )
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
