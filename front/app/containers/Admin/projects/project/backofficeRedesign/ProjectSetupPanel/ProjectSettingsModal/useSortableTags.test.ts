import { IInputTopicData } from 'api/input_topics/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useSortableTags from './useSortableTags';

const mockMoveInputTopic = jest.fn();

jest.mock('api/input_topics/useMoveInputTopic', () => () => ({
  mutate: mockMoveInputTopic,
}));

const makeTopic = (id: string): IInputTopicData => ({
  id,
  type: 'input_topic',
  attributes: {
    title_multiloc: { en: id },
    description_multiloc: {},
    full_title_multiloc: { en: id },
    icon: null,
    parent_icon: null,
    depth: 0,
    lft: 0,
    rgt: 0,
    children_count: 0,
  },
  relationships: {
    project: { data: { id: 'project', type: 'project' } },
  },
});

const topics = ['_1', '_2', '_3'].map(makeTopic);

const ids = (list: IInputTopicData[]) => list.map(({ id }) => id);

describe('useSortableTags', () => {
  beforeEach(() => {
    mockMoveInputTopic.mockReset();
  });

  it('reorders the tags locally while dragging', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(0, 2));

    expect(ids(result.current.ordered)).toEqual(['_2', '_3', '_1']);
    expect(mockMoveInputTopic).not.toHaveBeenCalled();
  });

  it('places a tag to the right of its new previous sibling', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(0, 1));
    act(() => result.current.dropRow('_1'));

    expect(mockMoveInputTopic).toHaveBeenCalledWith(
      { projectId: 'project', id: '_1', position: 'right', target_id: '_2' },
      expect.anything()
    );
  });

  it('places a tag moved to the top to the left of its new next sibling', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(2, 0));
    act(() => result.current.dropRow('_3'));

    expect(mockMoveInputTopic).toHaveBeenCalledWith(
      { projectId: 'project', id: '_3', position: 'left', target_id: '_1' },
      expect.anything()
    );
  });

  it('does not save when the tag ends up where it started', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(1, 0));
    act(() => result.current.moveRow(0, 1));
    act(() => result.current.dropRow('_2'));

    expect(mockMoveInputTopic).not.toHaveBeenCalled();
    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('restores the original order when saving fails', () => {
    mockMoveInputTopic.mockImplementation((_params, { onError }) => onError());
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(0, 2));
    act(() => result.current.dropRow('_1'));

    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('restores the original order when the drag is cancelled', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRow(0, 2));
    act(() => result.current.cancelDrag());

    expect(mockMoveInputTopic).not.toHaveBeenCalled();
    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('moves a tag one step with the keyboard and saves it', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRowBy(0, 1));

    expect(ids(result.current.ordered)).toEqual(['_2', '_1', '_3']);
    expect(mockMoveInputTopic).toHaveBeenCalledWith(
      { projectId: 'project', id: '_1', position: 'right', target_id: '_2' },
      expect.anything()
    );
  });

  it('ignores keyboard moves past either end', () => {
    const { result } = renderHook(() => useSortableTags('project', topics));

    act(() => result.current.moveRowBy(0, -1));
    act(() => result.current.moveRowBy(2, 1));

    expect(mockMoveInputTopic).not.toHaveBeenCalled();
    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('shows the refetched tags once they arrive', () => {
    const { result, rerender } = renderHook(
      ({ list }) => useSortableTags('project', list),
      { initialProps: { list: topics } }
    );

    act(() => result.current.moveRow(0, 2));
    act(() => result.current.dropRow('_1'));
    expect(ids(result.current.ordered)).toEqual(['_2', '_3', '_1']);

    const refetched = ['_3', '_2', '_1'].map(makeTopic);
    rerender({ list: refetched });

    expect(ids(result.current.ordered)).toEqual(['_3', '_2', '_1']);
  });
});
