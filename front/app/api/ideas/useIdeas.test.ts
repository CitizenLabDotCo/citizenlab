import { IIdeaData } from './types';

import { renderHook } from '@testing-library/react-hooks';

import useIdeas from './useIdeas';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

export const links = {
  last: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=9&page%5Bsize%5D=12&sort=random',
  next: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=2&page%5Bsize%5D=12&sort=random',
  self: 'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  first:
    'http://localhost:3000/web_api/v1/ideas?page%5Bnumber%5D=1&page%5Bsize%5D=12&sort=random',
  prev: null,
};

export const data: IIdeaData[] = [
  {
    id: '1615ec93-07a3-45a7-86f9-8fd27a0e3192',
    type: 'idea',
    attributes: {
      title_multiloc: {
        en: 'test idea ssdsdsd',
      },
      body_multiloc: {
        en: "<p>asdsad. dssda sa sad sdasdasas asads asad 222</p><p><br></p><p><img class='ql-alt-text-input-container keepHTML' alt='' data-cl2-text-image-text-reference='53eb1445-acaf-450a-a4eb-713b592fb4bc' src='https://demo.stg.citizenlab.co/uploads/c7e20cb9-f253-4c0c-aea1-e6e3c23c04c7/text_image/image/e9c47fc9-1232-4e18-b311-55a3dbcc6862/61e29288-4697-4b51-b6e8-678bd4933443.jpeg'></p><p><img class='ql-alt-text-input-container keepHTML' alt='' data-cl2-text-image-text-reference='4a6a3c4f-6ef4-434e-ad34-b232467c55e1' src='https://demo.stg.citizenlab.co/uploads/c7e20cb9-f253-4c0c-aea1-e6e3c23c04c7/text_image/image/ddc3ad9e-0263-4768-949b-9a8871935231/9f6471b5-def0-4964-9444-318a36565a16.jpeg'></p>",
      },
      slug: 'test-idea-ssdsdsd',
      publication_status: 'published',
      likes_count: 1,
      dislikes_count: 0,
      comments_count: 1,
      internal_comments_count: 1,
      official_feedbacks_count: 0,
      location_point_geojson: null,
      location_description: null,
      created_at: '2023-02-15T20:11:35.186Z',
      updated_at: '2023-03-03T10:15:07.625Z',
      published_at: '2023-02-15T20:11:35.186Z',
      budget: null,
      proposed_budget: null,
      baskets_count: 0,
      author_name: 'james speake',
      action_descriptor: {
        commenting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled: null,
        },
        reacting_idea: {
          enabled: true,
          disabled_reason: null,
          cancelling_enabled: true,
          up: {
            enabled: true,
            disabled_reason: null,
            future_enabled: null,
          },
          down: {
            enabled: false,
            disabled_reason: 'disliking_disabled',
            future_enabled: null,
          },
        },
        comment_reacting_idea: {
          enabled: true,
          disabled_reason: null,
          future_enabled: null,
        },
        voting: {
          enabled: false,
          disabled_reason: 'not_voting',
          future_enabled: null,
        },
      },
      anonymous: false,
      author_hash: 'abc123',
      followers_count: 3,
    },
    relationships: {
      topics: {
        data: [],
      },
      idea_images: {
        data: [],
      },
      phases: {
        data: [],
      },
      author: {
        data: {
          id: 'e7f2d2bd-1c2b-4691-baba-8b0f3d47f266',
          type: 'user',
        },
      },
      project: {
        data: {
          id: 'be3f645b-3e1d-4afc-b91b-d68c4dc0100b',
          type: 'project',
        },
      },
      idea_status: {
        data: {
          id: '3e81de96-a148-4245-9707-617623f2d798',
          type: 'idea_status',
        },
      },
      user_reaction: {
        data: null,
      },
      user_follower: {
        data: null,
      },
      assignee: {
        data: {
          id: '759e0fe5-5917-4924-9dd1-5abcfe86e602',
          type: 'user',
        },
      },
    },
  },
];

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*ideas';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data, links }));
  })
);

describe('useIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () =>
        useIdeas({
          'page[number]': 1,
          sort: 'random',
        }),
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
      () =>
        useIdeas({
          'page[number]': 1,
          sort: 'random',
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
