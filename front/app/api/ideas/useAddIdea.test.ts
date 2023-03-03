import { renderHook, act } from '@testing-library/react-hooks';

import useAddIdea from './useAddIdea';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { ideaData } from './__mocks__/useIdeaById';

const apiPath = '*ideas';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaData }));
  })
);

describe('useAddIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        author_id: null,
        project_id: null,
        assignee_id: null,
        idea_status_id: null,
        topic_ids: null,
        phase_ids: null,
        location_point_geojson: null,
        location_description: null,
        budget: null,
        proposed_budget: null,
        title_multiloc: {
          en: 'test',
        },
        publication_status: 'published',
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(ideaData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddIdea(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        author_id: null,
        project_id: null,
        assignee_id: null,
        idea_status_id: null,
        topic_ids: null,
        phase_ids: null,
        location_point_geojson: null,
        location_description: null,
        budget: null,
        proposed_budget: null,
        title_multiloc: {
          en: 'test',
        },
        publication_status: 'published',
        body_multiloc: {
          en: 'test',
        },
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
