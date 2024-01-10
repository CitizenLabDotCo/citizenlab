import { renderHook } from '@testing-library/react-hooks';

import useSurveyResults from './useSurveyResults';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import endpoints, {
  phaseApiPath,
  surveyResultsResponse,
} from './__mocks__/_mockServer';

const server = setupServer(
  endpoints['GET projects/:id/survey_results'],
  endpoints['GET phases/:id/survey_results']
);

describe('useSurveyResults', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for phase', async () => {
    const { result, waitFor } = renderHook(
      () => useSurveyResults({ phaseId: 'phaseId' }),
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
      rest.get(phaseApiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useSurveyResults({ phaseId: 'phaseId' }),
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
