import { renderHook } from 'utils/testUtils/rtl';

import useRootContents from './useRootContents';

let mockCanListSpaces = false;
let mockSpaces: { isLoading: boolean; isError: boolean; data?: unknown } = {
  isLoading: false,
  isError: false,
};

const loadedPage = (ids: string[]) => ({
  isLoading: false,
  isError: false,
  data: {
    pages: [{ data: ids.map((id) => ({ id })), meta: { total: ids.length } }],
  },
});

jest.mock('api/spaces/useSpaces', () => () => mockSpaces);
jest.mock(
  'api/project_folders_mini/useInfiniteProjectFoldersAdmin',
  () => () => loadedPage(['folder-1'])
);
jest.mock(
  'api/projects_mini_admin/useInfiniteProjectsMiniAdmin',
  () => () => loadedPage([])
);
jest.mock('hooks/useFeatureFlag', () => () => true);
jest.mock('utils/permissions', () => ({
  usePermission: ({ item }: { item: string }) =>
    item === 'space' ? mockCanListSpaces : true,
}));
jest.mock('utils/router', () => ({ useSearch: () => ({}) }));

describe('useRootContents', () => {
  beforeEach(() => {
    mockCanListSpaces = false;
    mockSpaces = { isLoading: false, isError: false };
  });

  it("ignores the spaces list for someone who can't list spaces", () => {
    // The project form's space picker shares this list and fetches it for
    // anyone; for a folder manager, that request is refused.
    mockSpaces = { isLoading: false, isError: true };

    const { result } = renderHook(() => useRootContents());

    expect(result.current.isError).toBe(false);
    expect(result.current.spaces).toBeUndefined();
    expect(result.current.landing).toEqual({
      kind: 'folder',
      id: 'folder-1',
    });
  });

  it('reports a failed spaces list for someone who can list spaces', () => {
    mockCanListSpaces = true;
    mockSpaces = { isLoading: false, isError: true };

    const { result } = renderHook(() => useRootContents());

    expect(result.current.isError).toBe(true);
    expect(result.current.landing).toBeUndefined();
  });
});
