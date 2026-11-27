import React, { StrictMode } from 'react';

import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { analysesData } from 'api/analyses/__mocks__/useAnalyses';
import useAnalyses from 'api/analyses/useAnalyses';
import useAnalysisInsights from 'api/analysis_insights/useAnalysisInsights';

import { render, waitFor } from 'utils/testUtils/rtl';

import Analysis from '.';

jest.mock('api/analyses/useAnalyses');
jest.mock('api/analysis_insights/useAnalysisInsights');
jest.mock('api/app_configuration/useAppConfiguration');
jest.mock('api/analysis_summaries/useAnalysisSummaries', () =>
  jest.fn(() => [])
);
jest.mock('utils/router', () => ({
  ...jest.requireActual('utils/router'),
  useParams: () => ({ projectId: 'projectId', phaseId: 'phaseId' }),
  useSearch: () => ({}),
}));
jest.mock('./AnalysisInsights', () => () => null);

const createdBodies: unknown[] = [];

const server = setupServer(
  http.post('*analyses', async ({ request }) => {
    createdBodies.push(await request.json());
    return HttpResponse.json({ data: analysesData[0] }, { status: 201 });
  })
);

describe('<Analysis /> auto-creation', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  beforeEach(() => {
    createdBodies.length = 0;
    (useAnalyses as jest.Mock).mockReturnValue({ data: { data: [] } });
    (useAnalysisInsights as jest.Mock).mockReturnValue({
      data: { data: [] },
    });
  });

  it('creates one analysis per question, even when the effect runs twice', async () => {
    render(
      <StrictMode>
        <Analysis customFieldId="cf1" textResponsesCount={12} />
        <Analysis customFieldId="cf1" textResponsesCount={12} />
        <Analysis customFieldId="cf2" textResponsesCount={12} />
      </StrictMode>
    );

    await waitFor(() => expect(createdBodies).toHaveLength(2));
    expect(createdBodies).toEqual([
      { analysis: { phase_id: 'phaseId', main_custom_field_id: 'cf1' } },
      { analysis: { phase_id: 'phaseId', main_custom_field_id: 'cf2' } },
    ]);
  });
});
