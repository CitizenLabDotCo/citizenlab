import { useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';
import useMoveInputTopic from 'api/input_topics/useMoveInputTopic';

// Keeps a group's dragged order on screen until the refetched tags arrive,
// then moves the dropped tag next to its new sibling.
const useSortableTags = (projectId: string, topics: IInputTopicData[]) => {
  const { mutate: moveInputTopic } = useMoveInputTopic();
  const [dragState, setDragState] = useState<{
    base: IInputTopicData[];
    order: IInputTopicData[];
  } | null>(null);

  // A new `topics` array means the server answered, so the draft is stale.
  const ordered = dragState?.base === topics ? dragState.order : topics;

  const moveRow = (fromIndex: number, toIndex: number) => {
    const order = [...ordered];
    const [moved] = order.splice(fromIndex, 1);
    order.splice(toIndex, 0, moved);
    setDragState({ base: topics, order });
  };

  const dropRow = (topicId: string) => {
    const newIndex = ordered.findIndex(({ id }) => id === topicId);
    const oldIndex = topics.findIndex(({ id }) => id === topicId);

    if (newIndex === oldIndex) {
      setDragState(null);
      return;
    }

    const previous = ordered.at(newIndex - 1);
    const next = ordered.at(newIndex + 1);

    moveInputTopic(
      newIndex > 0 && previous
        ? { projectId, id: topicId, position: 'right', target_id: previous.id }
        : { projectId, id: topicId, position: 'left', target_id: next?.id },
      { onError: () => setDragState(null) }
    );
  };

  const cancelDrag = () => setDragState(null);

  return { ordered, moveRow, dropRow, cancelDrag };
};

export default useSortableTags;
