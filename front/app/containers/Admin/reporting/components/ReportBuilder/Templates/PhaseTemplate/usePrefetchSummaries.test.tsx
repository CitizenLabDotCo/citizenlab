import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { IAnalysisData } from 'api/analyses/types';
import useAnalyses from 'api/analyses/useAnalyses';
import { summaryData } from 'api/analysis_summaries/__mocks__/useAnalysisSummary';
import { IFlatCustomField } from 'api/custom_fields/types';
import useCustomFields from 'api/custom_fields/useCustomFields';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import usePrefetchSummaries from './usePrefetchSummaries';

jest.mock('api/analyses/useAnalyses');
jest.mock('api/custom_fields/useCustomFields');

const REPORT_BUILDER_PATH =
  '/en/admin/reporting/report-builder/projects/p1/editor';

jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useLocation: () => ({ pathname: REPORT_BUILDER_PATH }),
}));

// The hook reads only `id` and `input_type` off each custom field, so we build
// minimal survey questions and cast at this trusted test boundary rather than
// constructing the full IFlatCustomField shape.
const surveyQuestions = [
  { id: 'q1', input_type: 'text' },
  { id: 'q2', input_type: 'text' },
] as unknown as IFlatCustomField[];

const buildAnalysis = (
  id: string,
  questionId: string,
  summaryId?: string
): IAnalysisData => ({
  id,
  type: 'analysis',
  attributes: {
    created_at: '2021-06-01T08:00:00.000Z',
    updated_at: '2021-06-01T08:00:00.000Z',
    participation_method: 'native_survey',
    show_insights: true,
    auto_insights_too_many_fields: false,
  },
  relationships: {
    project: { data: { id: 'p1', type: 'project' } },
    all_custom_fields: { data: [{ id: questionId, type: 'custom_field' }] },
    additional_custom_fields: { data: [] },
    main_custom_field: { data: { id: questionId, type: 'custom_field' } },
    insightables: {
      data: summaryId ? [{ id: summaryId, type: 'summary' }] : [],
    },
  },
});

const apiPath = '*/analyses/:analysisId/summaries/:id';
const server = setupServer(
  http.get(apiPath, () =>
    HttpResponse.json({ data: summaryData }, { status: 200 })
  )
);

const mockAnalyses = (analyses: IAnalysisData[]) => {
  (useAnalyses as jest.Mock).mockReturnValue({
    data: { data: analyses },
    isLoading: false,
  });
};

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

beforeEach(() => {
  (useCustomFields as jest.Mock).mockReturnValue({ data: surveyQuestions });
});

describe('usePrefetchSummaries', () => {
  // Regression test for the blank phase report: a survey question whose analysis
  // exists but has no summary must not block the template forever.
  it('becomes ready when one analysis has a summary and another does not', async () => {
    mockAnalyses([
      buildAnalysis('a1', 'q1', 'sum-1'),
      buildAnalysis('a2', 'q2'), // analysis exists, no summary
    ]);

    const { result } = renderHook(
      () => usePrefetchSummaries({ phaseId: 'ph1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    await waitFor(() => expect(result.current.summariesReady).toBe(true));

    // The summarised question shows up; the one without a summary is simply absent.
    expect(result.current.summaries.q1).toContain(
      summaryData.attributes.summary
    );
    expect(result.current.summaries.q2).toBeUndefined();
  });

  it('becomes ready when every analysis has a summary', async () => {
    mockAnalyses([
      buildAnalysis('a1', 'q1', 'sum-1'),
      buildAnalysis('a2', 'q2', 'sum-2'),
    ]);

    const { result } = renderHook(
      () => usePrefetchSummaries({ phaseId: 'ph1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    await waitFor(() => expect(result.current.summariesReady).toBe(true));

    expect(result.current.summaries.q1).toContain(
      summaryData.attributes.summary
    );
    expect(result.current.summaries.q2).toContain(
      summaryData.attributes.summary
    );
  });

  it('is ready immediately when there are no relevant analyses', () => {
    mockAnalyses([]);

    const { result } = renderHook(
      () => usePrefetchSummaries({ phaseId: 'ph1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.summariesReady).toBe(true);
    expect(result.current.summaries).toEqual({});
  });
});
