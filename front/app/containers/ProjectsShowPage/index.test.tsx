import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { usePhasePreview } from 'utils/phasePreview/runtime';
import { useParams } from 'utils/router';
import { render, screen } from 'utils/testUtils/rtl';

import ProjectsShowPage from './index';

jest.mock('js-confetti', () => jest.fn());
jest.mock('api/phases/usePhases', () => () => ({
  data: { data: [mockFirstPhase, mockCurrentPhase] },
  isLoading: false,
}));
jest.mock('api/me/useAuthUser', () => () => ({ data: null, isLoading: false }));
jest.mock('api/projects/useProjectBySlug', () => () => ({
  data: { data: project1 },
  status: 'success',
  isLoading: false,
}));
jest.mock('api/baskets_ideas/useVoting', () => ({
  VotingContext: ({ phaseId }: { phaseId?: string }) => (
    <div data-testid="voting-phase">{phaseId}</div>
  ),
}));
jest.mock('utils/phasePreview/runtime', () => ({
  ...jest.requireActual('utils/phasePreview/runtime'),
  usePhasePreview: jest.fn(),
}));
jest.mock('utils/router', () => ({ useParams: jest.fn() }));
jest.mock('./shared/header/ProjectHeader', () => () => null);
jest.mock('./shared/header/ProjectShowPageMeta', () => () => null);
jest.mock('./SucessModal', () => () => null);
jest.mock('./PhasePreviewPage', () => () => null);

const mockFirstPhase = {
  ...phasesData[0],
  id: 'first-phase',
  attributes: {
    ...phasesData[0].attributes,
    start_at: '2000-01-01',
    end_at: '2000-02-01',
  },
};
const mockCurrentPhase = {
  ...phasesData[1],
  id: 'current-phase',
  attributes: {
    ...phasesData[1].attributes,
    start_at: '2000-02-02',
    end_at: null,
  },
};

beforeEach(() => {
  jest.mocked(useParams).mockReturnValue({ slug: 'test', phaseNumber: '1' });
  jest.mocked(usePhasePreview).mockReturnValue(undefined);
});

it('preserves the public first-phase voting context when preview is inactive', () => {
  render(<ProjectsShowPage />);

  expect(screen.getByTestId('voting-phase')).toHaveTextContent('current-phase');
});

it('uses the first phase being edited inside the preview', () => {
  jest.mocked(usePhasePreview).mockReturnValue({
    project: project1,
    phase: mockFirstPhase,
    draft: {},
  });
  render(<ProjectsShowPage />);

  expect(screen.getByTestId('voting-phase')).toHaveTextContent('first-phase');
});
