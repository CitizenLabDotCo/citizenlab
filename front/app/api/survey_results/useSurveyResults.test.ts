import { renderHook } from '@testing-library/react-hooks';

import useSurveyResults from './useSurveyResults';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { SurveyResultsType } from './types';

let apiPath = '*projects/:projectId/survey_results';

const resultsData: SurveyResultsType = {
  data: {
    type: 'survey_results',
    attributes: {
      results: [],
      totalSubmissions: 5,
    },
  },
};
const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: resultsData }));
  })
);

describe('useSurveyResults', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly for project', async () => {
    const { result, waitFor } = renderHook(
      () => useSurveyResults({ projectId: 'projectId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(resultsData);
  });

  it('returns data correctly for phase', async () => {
    apiPath = '*phases/:phaseId/survey_results';
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: resultsData }));
      })
    );

    const { result, waitFor } = renderHook(
      () => useSurveyResults({ projectId: 'projectId', phaseId: 'phaseId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(resultsData);
  });
  it('returns error correctly', async () => {
    apiPath = '*phases/:phaseId/survey_results';
    server.use(
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useSurveyResults({ projectId: 'projectId', phaseId: 'phaseId' }),
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
