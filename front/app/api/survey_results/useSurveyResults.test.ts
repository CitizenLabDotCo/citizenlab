import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import endpoints, {
  phaseApiPath,
  surveyResultsResponse,
} from './__mocks__/_mockServer';
import useSurveyResults from './useSurveyResults';

const server = setupServer(
  endpoints['GET projects/:id/survey_results'],
  endpoints['GET phases/:id/survey_results']
);

describe('useSurveyResults', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for phase', async () => {
    const { result } = renderHook(
      () => useSurveyResults({ phaseId: 'phaseId', filterLogicIds: [] }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(surveyResultsResponse.data);
  });
  it('returns error correctly', async () => {
    server.use(
      http.get(phaseApiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useSurveyResults({ phaseId: 'phaseId', filterLogicIds: [] }),
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
