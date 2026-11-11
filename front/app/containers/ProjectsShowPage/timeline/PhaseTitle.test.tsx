import React from 'react';

import { phasesData } from 'api/phases/__mocks__/_mockServer';

import { usePhasePreview } from 'utils/phasePreview/runtime';
import { render, screen } from 'utils/testUtils/rtl';

import PhaseTitle from './PhaseTitle';

jest.mock('api/phases/usePhase', () => () => ({
  data: {
    data: {
      ...phasesData[0],
      attributes: {
        ...phasesData[0].attributes,
        start_at: null,
        end_at: null,
      },
    },
  },
}));
jest.mock('hooks/useLocalize', () => () => () => 'Standalone survey');
jest.mock('utils/phasePreview/runtime', () => ({
  ...jest.requireActual('utils/phasePreview/runtime'),
  usePhasePreview: jest.fn(),
}));

it('keeps the public date display without introducing preview fallback text', () => {
  jest.mocked(usePhasePreview).mockReturnValue(undefined);
  render(
    <PhaseTitle phaseId="phase" phaseNumber={null} descriptionHasContent />
  );

  expect(screen.getByText('Standalone survey')).toBeInTheDocument();
  expect(screen.queryByText('Dates to be announced')).not.toBeInTheDocument();
});
