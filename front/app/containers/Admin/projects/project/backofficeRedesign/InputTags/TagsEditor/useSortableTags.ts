import { useState } from 'react';

import { IInputTopicData } from 'api/input_topics/types';

const useSortableTags = (
  topics: IInputTopicData[],
  onReorder: (ordered: IInputTopicData[]) => void
) => {
  const [dragState, setDragState] = useState<{
    base: IInputTopicData[];
    order: IInputTopicData[];
  } | null>(null);

  // A new `topics` array means the list changed, so the drag preview is stale.
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

    if (newIndex !== oldIndex) onReorder(ordered);
    setDragState(null);
  };

  const cancelDrag = () => setDragState(null);

  return { ordered, moveRow, dropRow, cancelDrag };
};

export default useSortableTags;
