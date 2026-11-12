import React from 'react';

import { IAnalysisData } from 'api/analyses/types';
import { IInsights } from 'api/analysis_insights/types';

import { render, waitFor } from 'utils/testUtils/rtl';

import AnalysisInsights from './AnalysisInsights';

// The summary-generation threshold (a response count of 10) is inlined in this
// component, reading the textResponsesCount prop. These tests pin the behaviour
// around it: the default summary is only auto-generated when there are more than
// 10 responses, and the "other" filter is applied only for select/multiselect
// "other".

const mockAddSummary = jest.fn();
const mockPreCheck = jest.fn(
  (_vars: unknown, opts?: { onSuccess?: (data: unknown) => void }) =>
    opts?.onSuccess?.({ data: { attributes: { impossible_reason: null } } })
);

jest.mock('api/analysis_summaries/useAddAnalysisSummary', () =>
  jest.fn(() => ({ mutate: mockAddSummary, isPending: false }))
);
jest.mock('api/analysis_summary_pre_check/useAddAnalysisSummaryPreCheck', () =>
  jest.fn(() => ({ mutate: mockPreCheck, isPending: false }))
);
jest.mock('hooks/useFeatureFlag', () => jest.fn(() => false));
jest.mock('api/analysis_summaries/useAnalysisSummary', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          summary: 'A summary',
          filters: { input_follow_up_not_empty: true },
          missing_inputs_count: 0,
        },
        relationships: { background_task: { data: { id: 'bt1' } } },
      },
    },
  }))
);
jest.mock('api/analysis_questions/useAnalysisQuestion', () =>
  jest.fn(() => ({
    data: {
      data: {
        attributes: {
          question: 'A question',
          answer: 'An answer',
          filters: { input_follow_up_not_empty: true },
          missing_inputs_count: 0,
        },
        relationships: { background_task: { data: { id: 'bt2' } } },
      },
    },
  }))
);
jest.mock('api/analysis_background_tasks/useAnalysisBackgroundTask', () =>
  jest.fn(() => ({ data: undefined }))
);
jest.mock('api/analysis_inputs/useInfiniteAnalysisInputs', () =>
  jest.fn(() => ({ data: undefined }))
);
jest.mock('api/analysis_summaries/useRegenerateAnalysisSummary', () =>
  jest.fn(() => ({ mutate: jest.fn(), isPending: false }))
);
jest.mock('api/analysis_questions/useRegenerateAnalysisQuestion', () =>
  jest.fn(() => ({ mutate: jest.fn(), isPending: false }))
);
jest.mock(
  'containers/Admin/projects/project/analysis/Insights/InsightBody',
  () => () => null
);
jest.mock(
  'containers/Admin/projects/project/analysis/Insights/InsightFooter',
  () => () => null
);
jest.mock(
  'containers/Admin/projects/project/analysis/Insights/SummaryHeader',
  () => () => null
);
jest.mock(
  'containers/Admin/projects/project/analysis/Insights/QuestionHeader',
  () => () => null
);
// The Link mock ignores `search`, so the button is stubbed to read its props.
const mockButtonWithLink = jest.fn(
  ({ children }: { children?: React.ReactNode }) => children
);
jest.mock(
  'components/UI/ButtonWithLink',
  () => (props: { children?: React.ReactNode }) => mockButtonWithLink(props)
);
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
  });

  it('does not auto-generate a summary at the threshold (10 responses)', async () => {
    render(
      <AnalysisInsights
        analysis={analysis}
        insights={noInsights}
        textResponsesCount={10}
        projectId="projectId"
      />
    );

    await waitFor(() => {
      expect(mockPreCheck).not.toHaveBeenCalled();
    });
    expect(mockAddSummary).not.toHaveBeenCalled();
  });

  it('auto-generates a summary above the threshold (11 responses)', async () => {
    render(
      <AnalysisInsights
        analysis={analysis}
        insights={noInsights}
        textResponsesCount={11}
        projectId="projectId"
      />
    );

    await waitFor(() => {
      expect(mockPreCheck).toHaveBeenCalled();
    });
    expect(mockAddSummary).toHaveBeenCalledWith(
      expect.objectContaining({ analysisId: 'a1' })
    );
  });

  it('restricts the summary to "other" responses for an other_option source', async () => {
    render(
      <AnalysisInsights
        analysis={analysis}
        insights={noInsights}
        textResponsesCount={11}
        projectId="projectId"
        textResponseSource="other_option"
      />
    );

    await waitFor(() => {
      expect(mockAddSummary).toHaveBeenCalled();
    });
    const { filters } = mockAddSummary.mock.calls[0][0];
    expect(filters[OTHER_FILTER_KEY]).toEqual(['other']);
  });

  it('does not add the "other" filter for plain text questions', async () => {
    render(
      <AnalysisInsights
        analysis={analysis}
        insights={noInsights}
        textResponsesCount={11}
        projectId="projectId"
        textResponseSource="free_text"
      />
    );

    await waitFor(() => {
      expect(mockAddSummary).toHaveBeenCalled();
    });
    const { filters } = mockAddSummary.mock.calls[0][0];
    expect(filters).not.toHaveProperty(OTHER_FILTER_KEY);
  });
});

// The Community Monitor live monitor URL carries no $projectId/$phaseId, so the
// Explore link must use the ids passed down as props, not the route params.
describe('<AnalysisInsights /> Explore link', () => {
  const insightOfType = (
    type: 'summary' | 'analysis_question'
  ): IInsights => ({
    data: [
      {
        id: 'i1',
        type: 'insight',
        relationships: {
          background_task: { data: { id: 'bt1', type: 'background_task' } },
          insightable: { data: { id: 'ins1', type } },
        },
      },
    ],
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it.each(['summary', 'analysis_question'] as const)(
    'targets the given project and phase for a %s',
    (type) => {
      render(
        <AnalysisInsights
          analysis={analysis}
          insights={insightOfType(type)}
          textResponsesCount={11}
          projectId="cmProjectId"
          phaseId="cmPhaseId"
        />
      );

      expect(mockButtonWithLink).toHaveBeenCalledWith(
        expect.objectContaining({
          to: '/admin/projects/$projectId/analysis/$analysisId',
          params: { projectId: 'cmProjectId', analysisId: 'a1' },
          search: { input_follow_up_not_empty: true, phase_id: 'cmPhaseId' },
        })
      );
    }
  );
});
