import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData } from 'api/phases/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import usePhasePlacementMove from './usePhasePlacementMove';

const mockUpdate = jest.fn();
const mockReset = jest.fn();
const mockInvalidate = jest.fn();
const mockTimeline: IPhaseData[] = [
  {
    ...mockPhaseIdeationData,
    id: 'timeline',
    attributes: {
      ...mockPhaseIdeationData.attributes,
      start_at: '2026-06-01',
      end_at: '2026-06-15',
      placement_type: 'on_timeline',
    },
  },
];
const survey: IPhaseData = {
  ...mockPhaseIdeationData,
  id: 'survey',
  attributes: {
    ...mockPhaseIdeationData.attributes,
    participation_method: 'native_survey',
    placement_type: 'standalone',
    start_at: '2026-06-10',
    end_at: '2026-06-20',
  },
};

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ invalidateQueries: mockInvalidate }),
}));
jest.mock('api/phases/usePhases', () => () => ({
  data: { data: mockTimeline },
}));
jest.mock('api/phases/useUpdatePhase', () => () => ({
  mutate: mockUpdate,
  isPending: false,
  reset: mockReset,
}));
jest.mock('api/project_page_layout/useProjectPageLayout', () => () => ({
  data: { data: { attributes: { craftjs_json: {} } } },
}));

beforeEach(() => jest.clearAllMocks());

it('keeps date edits local and discards them when the dialog is reopened', () => {
  const { result, unmount } = renderHook(() => usePhasePlacementMove(survey));
  expect(result.current.blocked).toBe(true);

  act(() =>
    result.current.changeDates('timeline', {
      start_at: '2026-06-01',
      end_at: '2026-06-10',
    })
  );

  expect(result.current.blocked).toBe(false);
  expect(mockUpdate).not.toHaveBeenCalled();
  unmount();

  const reopened = renderHook(() => usePhasePlacementMove(survey));
  expect(reopened.result.current.blocked).toBe(true);
  expect(reopened.result.current.datesChanged).toBe(false);
});

it('sends survey and timeline date changes in one move request', () => {
  const { result } = renderHook(() => usePhasePlacementMove(survey));
  act(() => {
    result.current.changeDates('timeline', {
      start_at: '2026-06-01',
      end_at: '2026-06-11',
    });
    result.current.changeDates('survey', {
      start_at: '2026-06-11',
      end_at: '2026-06-21',
    });
  });
  expect(result.current.blocked).toBe(false);

  act(() => result.current.move({ onSuccess: jest.fn() }));

  expect(mockUpdate).toHaveBeenCalledWith(
    {
      phaseId: 'survey',
      placement_type: 'on_timeline',
      start_at: '2026-06-11',
      end_at: '2026-06-21',
      timeline_phase_dates: [
        { id: 'timeline', start_at: '2026-06-01', end_at: '2026-06-11' },
      ],
    },
    expect.objectContaining({ onSuccess: expect.any(Function) })
  );
});
