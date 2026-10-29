import { IInputTopicData } from 'api/input_topics/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useTagsDraft from './useTagsDraft';

const mockAdd = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockMove = jest.fn();
const mockRefetch = jest.fn();
let mockTopics: IInputTopicData[] = [];

jest.mock('api/input_topics/useInputTopics', () => () => ({
  data: { data: mockTopics },
  refetch: mockRefetch,
}));
jest.mock('api/input_topics/useAddInputTopic', () => () => ({
  mutateAsync: mockAdd,
}));
jest.mock('api/input_topics/useUpdateInputTopic', () => () => ({
  mutateAsync: mockUpdate,
}));
jest.mock('api/input_topics/useDeleteInputTopic', () => () => ({
  mutateAsync: mockDelete,
}));
jest.mock('api/input_topics/useMoveInputTopic', () => () => ({
  mutateAsync: mockMove,
}));

const makeTopic = (id: string, parentId?: string): IInputTopicData => ({
  id,
  type: 'input_topic',
  attributes: {
    title_multiloc: { en: id },
    description_multiloc: {},
    full_title_multiloc: { en: id },
    icon: null,
    parent_icon: null,
    depth: parentId ? 1 : 0,
    lft: 0,
    rgt: 0,
    children_count: 0,
  },
  relationships: {
    project: { data: { id: 'project', type: 'project' } },
    parent: { data: parentId ? { id: parentId, type: 'input_topic' } : null },
  },
});

const values = (title: string) => ({
  title_multiloc: { en: title },
  description_multiloc: {},
});

const ids = (tags: IInputTopicData[] = []) => tags.map(({ id }) => id);

const save = async (result: { current: ReturnType<typeof useTagsDraft> }) => {
  let saved = false;
  await act(async () => {
    saved = await result.current.save();
  });
  return saved;
};

describe('useTagsDraft', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockTopics = [makeTopic('a'), makeTopic('a1', 'a'), makeTopic('b')];
    mockRefetch.mockImplementation(async () => ({
      data: { data: mockTopics },
    }));
    mockAdd.mockImplementation(async ({ title_multiloc }) => ({
      data: { id: `saved-${title_multiloc.en}` },
    }));
  });

  it('changes only the draft until saved', () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.addTag(values('c')));
    act(() => result.current.removeTag('b'));

    expect(result.current.dirty).toBe(true);
    expect(
      result.current.tags?.map(({ attributes }) => attributes.title_multiloc.en)
    ).toEqual(['a', 'a1', 'c']);
    expect(mockAdd).not.toHaveBeenCalled();
    expect(mockDelete).not.toHaveBeenCalled();
  });

  it('removes subtags together with their tag', () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.removeTag('a'));

    expect(ids(result.current.tags)).toEqual(['b']);
  });

  it('deletes a tag once on save, leaving its subtags to the API', async () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.removeTag('a'));

    expect(await save(result)).toBe(true);
    expect(mockDelete).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledWith({ projectId: 'project', id: 'a' });
    expect(result.current.dirty).toBe(false);
  });

  it('saves edits to existing tags', async () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.updateTag('b', { ...values('B'), icon: '🌳' }));

    expect(await save(result)).toBe(true);
    expect(mockUpdate).toHaveBeenCalledWith({
      projectId: 'project',
      id: 'b',
      title_multiloc: { en: 'B' },
      description_multiloc: {},
      icon: '🌳',
    });
  });

  it('creates a new tag before the new subtags under it', async () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.addTag(values('c')));
    const draftId = result.current.tags?.at(-1)?.id ?? '';
    act(() => result.current.addTag(values('c1'), draftId));

    expect(await save(result)).toBe(true);
    expect(mockAdd.mock.calls.map(([call]) => call.parent_id)).toEqual([
      undefined,
      'saved-c',
    ]);
  });

  it('moves a reordered tag next to its new neighbour', async () => {
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.reorder([makeTopic('b'), makeTopic('a')]));
    expect(ids(result.current.tags)).toEqual(['b', 'a1', 'a']);

    expect(await save(result)).toBe(true);
    expect(mockMove).toHaveBeenCalledTimes(1);
    expect(mockMove).toHaveBeenCalledWith({
      projectId: 'project',
      id: 'b',
      position: 'left',
      target_id: 'a',
    });
  });

  it('keeps what failed in the draft and only retries that', async () => {
    mockDelete.mockRejectedValueOnce(new Error('failed'));
    const { result } = renderHook(() => useTagsDraft('project'));

    act(() => result.current.removeTag('b'));
    act(() => result.current.addTag(values('c')));

    expect(await save(result)).toBe(false);
    expect(result.current.dirty).toBe(true);
    expect(ids(result.current.tags)).toEqual(['a', 'a1', 'saved-c']);

    mockTopics = [...mockTopics, makeTopic('saved-c')];
    expect(await save(result)).toBe(true);
    expect(mockAdd).toHaveBeenCalledTimes(1);
    expect(mockDelete).toHaveBeenCalledTimes(2);
  });
});
