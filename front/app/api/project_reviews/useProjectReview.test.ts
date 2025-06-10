import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ProjectReviewData } from './types';
import useProjectReview from './useProjectReview';

const apiPath = '*projects/:id/review';

const projectReviewData: ProjectReviewData = {
  id: 'id',
  type: 'project_review',
  attributes: {
    state: 'approved',
    approved_at: null,
    created_at: '2021-09-01T00:00:00.000Z',
    updated_at: '2021-09-01T00:00:00.000Z',
  },
  relationships: {
    project: {
      data: {
        id: 'id',
        type: 'project',
      },
    },
    requester: {
      data: {
        id: 'id',
        type: 'user',
      },
    },
    reviewer: {
      data: {
        id: 'id',
        type: 'user',
      },
    },
  },
};
const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: projectReviewData }, { status: 200 });
  })
);

describe('useProjectReview', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(() => useProjectReview('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(projectReviewData);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useProjectReview('id'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
