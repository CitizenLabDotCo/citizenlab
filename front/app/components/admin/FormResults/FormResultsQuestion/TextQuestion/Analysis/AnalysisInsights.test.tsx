import React from 'react';

import { IAnalysisData } from 'api/analyses/types';
import { IInsights } from 'api/analysis_insights/types';

import { render, waitFor } from 'utils/testUtils/rtl';

import AnalysisInsights from './AnalysisInsights';

// The summary-generation threshold (an input count of 10) is inlined in this
// component. These tests pin the behaviour around it: the default summary is
// only auto-generated when the analysis has more than 10 inputs, and the
// "other" filter is applied only for select/multiselect "other".

let mockInputCount = 0;
const mockAddSummary = jest.fn();
const mockPreCheck = jest.fn(
  (_vars: unknown, opts?: { onSuccess?: (data: unknown) => void }) =>
    opts?.onSuccess?.({ data: { attributes: { impossible_reason: null } } })
);

jest.mock('api/analysis_inputs/useInfiniteAnalysisInputs', () =>
  jest.fn(() => ({
    data: { pages: [{ meta: { filtered_count: mockInputCount } }] },
  }))
);
jest.mock('api/analysis_summaries/useAddAnalysisSummary', () =>
  jest.fn(() => ({ mutate: mockAddSummary, isLoading: false }))
);
jest.mock('api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck', () =>
  jest.fn(() => ({ mutate: mockPreCheck, isLoading: false }))
);
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => false));
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useSearch: () => ({}),
}));

const CUSTOM_FIELD_ID = 'cf1';
const OTHER_FILTER_KEY = `input_custom_${CUSTOM_FIELD_ID}`;

const analysis: IAnalysisData = {
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
    main_custom_field: { data: { id: CUSTOM_FIELD_ID, type: 'custom_field' } },
  },
};

const noInsights: IInsights = { data: [] };

describe('<AnalysisInsights /> auto-summary threshold', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockInputCount = 0;
  });

  it('does not auto-generate a summary at the threshold (10 inputs)', async () => {
    mockInputCount = 10;

    render(<AnalysisInsights analysis={analysis} insights={noInsights} />);

    await waitFor(() => {
      expect(mockPreCheck).not.toHaveBeenCalled();
    });
    expect(mockAddSummary).not.toHaveBeenCalled();
  });

  it('auto-generates a summary above the threshold (11 inputs)', async () => {
    mockInputCount = 11;

    render(<AnalysisInsights analysis={analysis} insights={noInsights} />);

    await waitFor(() => {
      expect(mockPreCheck).toHaveBeenCalled();
    });
    expect(mockAddSummary).toHaveBeenCalledWith(
      expect.objectContaining({ analysisId: 'a1' })
    );
  });

  it('restricts the summary to "other" responses when hasOtherResponses is true', async () => {
    mockInputCount = 11;

    render(
      <AnalysisInsights
        analysis={analysis}
        insights={noInsights}
        hasOtherResponses
      />
    );

    await waitFor(() => {
      expect(mockAddSummary).toHaveBeenCalled();
    });
    const { filters } = mockAddSummary.mock.calls[0][0];
    expect(filters[OTHER_FILTER_KEY]).toEqual(['other']);
  });

  it('does not add the "other" filter for plain text questions', async () => {
    mockInputCount = 11;

    render(<AnalysisInsights analysis={analysis} insights={noInsights} />);

    await waitFor(() => {
      expect(mockAddSummary).toHaveBeenCalled();
    });
    const { filters } = mockAddSummary.mock.calls[0][0];
    expect(filters).not.toHaveProperty(OTHER_FILTER_KEY);
  });
});
