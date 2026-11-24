import { mockPhaseIdeationData } from 'api/phases/__mocks__/_mockServer';
import { IPhaseData, PhaseUpdateError } from 'api/phases/types';

import { HttpError } from 'utils/cl-react-query/fetcher';
import { act, renderHook } from 'utils/testUtils/rtl';

import usePhasePlacementMove from './usePhasePlacementMove';

const mockUpdate = jest.fn();
const mockReset = jest.fn();
let mockUpdateError: PhaseUpdateError | null = null;
const mockInvalidate = jest.fn();
const mockTimelineRefetch = jest.fn();
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
  isError: false,
  isFetching: false,
  refetch: mockTimelineRefetch,
}));
jest.mock('api/phases/useUpdatePhase', () => () => ({
  mutate: mockUpdate,
  error: mockUpdateError,
  isPending: false,
  reset: mockReset,
}));
const mockLayoutRefetch = jest.fn();
let mockLayoutResult: {
  data: { data: { attributes: { craftjs_json: object } } } | undefined;
  isError: boolean;
  error: HttpError | null;
  isFetching: boolean;
  refetch: typeof mockLayoutRefetch;
} = {
  data: { data: { attributes: { craftjs_json: {} } } },
  isError: false,
  error: null,
  isFetching: false,
  refetch: mockLayoutRefetch,
};
jest.mock(
  'api/project_page_layout/useProjectPageLayout',
  () => () => mockLayoutResult
);

beforeEach(() => {
  jest.clearAllMocks();
  mockUpdateError = null;
});

it('keeps date edits local and discards them when the dialog is reopened', () => {
  const { result, unmount } = renderHook(() => usePhasePlacementMove(survey));
  expect(result.current.blocked).toBe(true);
  expect(result.current.dateConflictCount).toBe(1);

  act(() =>
    result.current.changeDates('timeline', {
      start_at: '2026-06-01',
      end_at: '2026-06-10',
    })
  );

  expect(result.current.blocked).toBe(false);
  expect(result.current.dateConflictCount).toBe(0);
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

it('keeps rows in their original order when draft start dates cross other phases', () => {
  const { result } = renderHook(() => usePhasePlacementMove(survey));
  expect(result.current.proposedTimeline.map(({ id }) => id)).toEqual([
    'timeline',
    'survey',
  ]);

  act(() =>
    result.current.changeDates('survey', {
      start_at: '2026-05-01',
      end_at: '2026-05-10',
    })
  );
  expect(result.current.proposedTimeline.map(({ id }) => id)).toEqual([
    'timeline',
    'survey',
  ]);
  expect(result.current.blocked).toBe(false);
});

it('allows moving when the project has no page layout', () => {
  const previous = mockLayoutResult;
  mockLayoutResult = {
    ...previous,
    data: undefined,
    isError: true,
    error: new HttpError('Unsupported case. No valid JSON.', 404),
  };
  try {
    const { result } = renderHook(() => usePhasePlacementMove(survey));
    expect(result.current.loaded).toBe(true);
    expect(result.current.loadFailed).toBe(false);
    expect(result.current.shownOnProjectPage).toBe(false);
  } finally {
    mockLayoutResult = previous;
  }
});

it('exposes a retry when loading the layout fails', () => {
  const previous = mockLayoutResult;
  mockLayoutResult = {
    ...previous,
    data: undefined,
    isError: true,
    error: new HttpError('Unsupported case. No valid JSON.', 500),
  };
  try {
    const { result } = renderHook(() => usePhasePlacementMove(survey));
    expect(result.current.loaded).toBe(false);
    expect(result.current.loadFailed).toBe(true);
    act(() => result.current.retryLoading());
    expect(mockLayoutRefetch).toHaveBeenCalledTimes(1);
  } finally {
    mockLayoutResult = previous;
  }
});

it('identifies the edited phase responsible for a server validation error', () => {
  mockUpdateError = {
    errors: { base: [{ error: 'duration_too_short' }] },
    meta: { phase_id: 'timeline' },
  };
  const { result } = renderHook(() => usePhasePlacementMove(survey));
  expect(result.current.errorPhase?.id).toBe('timeline');
});
