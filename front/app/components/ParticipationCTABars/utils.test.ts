import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { getCurrentPhase } from 'api/phases/utils';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { getPhasePreview } from 'utils/phasePreview/runtime';

import { getCTAPhase } from './utils';

jest.mock('utils/phasePreview/runtime', () => ({ getPhasePreview: jest.fn() }));
const preview = jest.mocked(getPhasePreview);

it('uses the selected future phase in the phone instead of the active project phase', () => {
  const active = {
    ...phasesData[0],
    attributes: {
      ...phasesData[0].attributes,
      start_at: '2020-01-01',
      end_at: null,
    },
  };
  const future = {
    ...phasesData[1],
    attributes: {
      ...phasesData[1].attributes,
      start_at: '2090-01-01',
      end_at: null,
    },
  };
  preview.mockReturnValue({ project: project1, phase: future, draft: {} });

  expect(getCTAPhase([active, future])).toBe(future);
  expect(getCTAPhase([active])).toBeUndefined();
});

it('keeps public pages on the current phase', () => {
  preview.mockReturnValue(undefined);
  const active = {
    ...phasesData[0],
    attributes: {
      ...phasesData[0].attributes,
      start_at: '2020-01-01',
      end_at: null,
    },
  };
  expect(getCTAPhase([active])).toBe(active);
  expect(getCTAPhase([active])).toBe(getCurrentPhase([active]));
});
