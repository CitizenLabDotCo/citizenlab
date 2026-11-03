import { IInputTopicData } from 'api/input_topics/types';

import { act, renderHook } from 'utils/testUtils/rtl';

import useSortableTags from './useSortableTags';

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
  it('reorders the tags locally while dragging', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSortableTags(topics, onReorder));

    act(() => result.current.moveRow(0, 2));

    expect(ids(result.current.ordered)).toEqual(['_2', '_3', '_1']);
    expect(onReorder).not.toHaveBeenCalled();
  });

  it('hands the new order over on drop', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSortableTags(topics, onReorder));

    act(() => result.current.moveRow(0, 1));
    act(() => result.current.dropRow('_1'));

    expect(ids(onReorder.mock.calls[0][0])).toEqual(['_2', '_1', '_3']);
  });

  it('does not report a drop where the tag ends up where it started', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSortableTags(topics, onReorder));

    act(() => result.current.moveRow(1, 0));
    act(() => result.current.moveRow(0, 1));
    act(() => result.current.dropRow('_2'));

    expect(onReorder).not.toHaveBeenCalled();
    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('restores the original order when the drag is cancelled', () => {
    const onReorder = jest.fn();
    const { result } = renderHook(() => useSortableTags(topics, onReorder));

    act(() => result.current.moveRow(0, 2));
    act(() => result.current.cancelDrag());

    expect(onReorder).not.toHaveBeenCalled();
    expect(ids(result.current.ordered)).toEqual(['_1', '_2', '_3']);
  });

  it('shows the new list once it changes', () => {
    const { result, rerender } = renderHook(
      ({ list }) => useSortableTags(list, jest.fn()),
      { initialProps: { list: topics } }
    );

    act(() => result.current.moveRow(0, 2));

    const reordered = ['_3', '_2', '_1'].map(makeTopic);
    rerender({ list: reordered });

    expect(ids(result.current.ordered)).toEqual(['_3', '_2', '_1']);
  });
});
