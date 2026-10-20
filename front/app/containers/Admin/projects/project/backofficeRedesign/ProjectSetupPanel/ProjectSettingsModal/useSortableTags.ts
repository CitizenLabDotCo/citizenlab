import { useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';

const useSortableTags = (projectId: string, topics: IInputTopicData[]) => {
  const { mutate: moveInputTopic } = useMoveInputTopic();
  const [dragState, setDragState] = useState<{
    base: IInputTopicData[];
    order: IInputTopicData[];
  } | null>(null);

  // A new `topics` array means the server answered, so the draft is stale.
  const ordered = dragState?.base === topics ? dragState.order : topics;

  const reorder = (fromIndex: number, toIndex: number) => {
    const order = [...ordered];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    return order;
  };

  const save = (order: IInputTopicData[], topicId: string) => {
    const newIndex = order.findIndex(({ id }) => id === topicId);
    const oldIndex = topics.findIndex(({ id }) => id === topicId);

    if (newIndex === oldIndex) {
      setDragState(null);
      return;
    }

    setDragState({ base: topics, order });

    const previous = order.at(newIndex - 1);
    const next = order.at(newIndex + 1);

    moveInputTopic(
      newIndex > 0 && previous
        ? { projectId, id: topicId, position: 'right', target_id: previous.id }
        : { projectId, id: topicId, position: 'left', target_id: next?.id },
      { onError: () => setDragState(null) }
    );
  };

  const moveRow = (fromIndex: number, toIndex: number) =>
    setDragState({ base: topics, order: reorder(fromIndex, toIndex) });

  const dropRow = (topicId: string) => save(ordered, topicId);

  // Keyboard alternative to dragging: moves one step and saves right away.
  const moveRowBy = (index: number, offset: number) => {
    const toIndex = index + offset;
    if (toIndex < 0 || toIndex >= ordered.length) return;

    save(reorder(index, toIndex), ordered[index].id);
  };

  const cancelDrag = () => setDragState(null);

  return { ordered, moveRow, moveRowBy, dropRow, cancelDrag };
};

export default useSortableTags;
