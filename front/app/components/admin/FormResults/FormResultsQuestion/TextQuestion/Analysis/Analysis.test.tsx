import React from 'react';

import { IAnalysisData } from 'api/analyses/types';
import useAnalyses from 'api/analyses/useAnalyses';
import { IInsightData } from 'api/analysis_insights/types';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import { render, screen, waitFor } from 'utils/testUtils/rtl';

import Analysis from '.';

// The auto-create threshold lives in this component as AUTO_ANALYSIS_MIN_RESPONSES
// (= 10). These tests pin the behaviour around it: at/below the threshold the info
// box is shown and no analysis is created; above it, an analysis is auto-created.

jest.mock('api/analyses/useAnalyses');
jest.mock('api/analysis_insights/useAnalysisInsights');
jest.mock('api/app_configuration/useAppConfiguration');

const mockAddAnalysis = jest.fn();
jest.mock('api/analyses/useAddAnalysis', () =>
  jest.fn(() => ({ mutate: mockAddAnalysis, isLoading: false }))
);
jest.mock('api/analyses/useUpdateAnalysis', () =>
  jest.fn(() => ({ mutate: jest.fn(), isLoading: false }))
);
jest.mock('api/analysis_summaries/useAnalysisSummaries', () =>
  jest.fn(() => [])
);
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ projectId: 'projectId', phaseId: 'phaseId' }),
  useSearch: () => ({}),
}));
// Stub the child so this test stays focused on the threshold / info-box logic.
jest.mock('./AnalysisInsights', () => () => null);

const CUSTOM_FIELD_ID = 'cf1';
const INFO_TEXT =
  /generated automatically once there are more than 10 responses/i;

const analysisFor = (customFieldId: string): IAnalysisData => ({
  id: 'a1',
  type: 'analysis',
  attributes: {
    created_at: '2021-06-01T08:00:00.000Z',
    updated_at: '2021-06-01T08:00:00.000Z',
    participation_method: 'native_survey',
    show_insights: true,
    auto_insights_too_many_fields: false,
  },
  relationships: {
    all_custom_fields: { data: [] },
    main_custom_field: { data: { id: customFieldId, type: 'custom_field' } },
  },
});

const summaryInsight: IInsightData = {
  id: 'i1',
  type: 'insight',
  relationships: {
    background_task: { data: { id: 'bt1', type: 'background_task' } },
    insightable: { data: { id: 's1', type: 'summary' } },
  },
};

const setAnalyses = (analyses: IAnalysisData[]) =>
  (useAnalyses as jest.Mock).mockReturnValue({ data: { data: analyses } });
const setInsights = (insights: IInsightData[]) =>
  (useAnalysisInsights as jest.Mock).mockReturnValue({
    data: { data: insights },
  });

describe('<Analysis /> auto-analysis threshold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAnalyses([]);
    setInsights([]);
  });

  it('shows the info box and does not auto-create an analysis at the threshold (10 responses)', async () => {
    render(
      <Analysis customFieldId={CUSTOM_FIELD_ID} textResponsesCount={10} />
    );

    expect(screen.getByText(INFO_TEXT)).toBeInTheDocument();
    // The manual "Open AI analysis" button is kept beneath the info box.
    expect(screen.getByText('Open AI analysis')).toBeInTheDocument();
    await waitFor(() => {
      expect(mockAddAnalysis).not.toHaveBeenCalled();
    });
  });

  it('auto-creates an analysis and hides the info box above the threshold (11 responses)', async () => {
    render(
      <Analysis customFieldId={CUSTOM_FIELD_ID} textResponsesCount={11} />
    );

    await waitFor(() => {
      expect(mockAddAnalysis).toHaveBeenCalledWith(
        expect.objectContaining({ mainCustomField: CUSTOM_FIELD_ID })
      );
    });
    expect(screen.queryByText(INFO_TEXT)).not.toBeInTheDocument();
  });

  it('shows the info box for plain text questions too (no "other" responses)', () => {
    render(
      <Analysis
        customFieldId={CUSTOM_FIELD_ID}
        textResponsesCount={5}
        textResponseSource="free_text"
      />
    );

    expect(screen.getByText(INFO_TEXT)).toBeInTheDocument();
  });

  it('does not show the info box when a summary already exists', () => {
    setAnalyses([analysisFor(CUSTOM_FIELD_ID)]);
    setInsights([summaryInsight]);

    render(<Analysis customFieldId={CUSTOM_FIELD_ID} textResponsesCount={5} />);

    expect(screen.queryByText(INFO_TEXT)).not.toBeInTheDocument();
    expect(mockAddAnalysis).not.toHaveBeenCalled();
  });
});
