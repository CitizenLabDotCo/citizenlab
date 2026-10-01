import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useSurveyGenerationJob from './useSurveyGenerationJob';

const apiPath = '*jobs';

const jobData = {
  id: 'job-1',
  type: 'job',
  attributes: {
    progress: 1,
    error_count: 0,
    total: 1,
    completed_at: '2026-09-30T08:01:00.000Z',
    created_at: '2026-09-30T08:00:00.000Z',
    updated_at: '2026-09-30T08:01:00.000Z',
    job_type: 'IdeaCustomFields::SurveyGenerationJob',
    errors: [],
  },
  relationships: {
    owner: { data: { id: 'user-1', type: 'user' } },
    project: { data: { id: 'project-1', type: 'project' } },
    context: { data: { id: 'phase-1', type: 'phase' } },
  },
};

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json({ data: [jobData] }, { status: 200 });
  })
);

describe('useSurveyGenerationJob', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('requests the survey generation jobs of the phase', async () => {
    let requestUrl: URL | undefined;
    server.use(
      http.get(apiPath, ({ request }) => {
        requestUrl = new URL(request.url);
        return HttpResponse.json({ data: [jobData] }, { status: 200 });
      })
    );

    const { result } = renderHook(() => useSurveyGenerationJob('phase-1'), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual([jobData]);
    expect(requestUrl?.searchParams.get('context_type')).toBe('Phase');
    expect(requestUrl?.searchParams.get('context_id')).toBe('phase-1');
    expect(requestUrl?.searchParams.get('root_job_type')).toBe(
      'IdeaCustomFields::SurveyGenerationJob'
    );
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useSurveyGenerationJob('phase-1'), {
      wrapper: createQueryClientWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
