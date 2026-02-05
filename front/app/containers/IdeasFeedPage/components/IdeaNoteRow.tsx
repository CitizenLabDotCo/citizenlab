import React from 'react';

import StickyNote, { TopicInfo } from '../StickyNotes/StickyNote';
import { getTopicColor } from '../topicsColor';

interface TopicData {
  emoji: string | null;
  name: string;
}

interface Props {
  ideaId: string;
  topicIds: string[];
  topicDataMap: Map<string, TopicData>;
  topicId?: string | null;
  parentTopicId?: string | null;
  centeredIdeaId?: string;
  onSelect: (ideaId: string) => void;
}

const IdeaNoteRow = ({
  ideaId,
  topicIds,
  topicDataMap,
  topicId,
  parentTopicId,
  centeredIdeaId,
  onSelect,
}: Props) => {
  // Use parentTopicId for color when filtering by subtopic, otherwise use the first topic
  const colorTopicId = parentTopicId || topicId || topicIds[0];
  const topicBackgroundColor = getTopicColor(colorTopicId);

  // Get topic info (emoji + name) from all topics associated with this idea
  const topics: TopicInfo[] = topicIds
    .map((id) => topicDataMap.get(id))
    .filter((data): data is TopicData => data != null && data.emoji != null)
    .map((data) => ({ emoji: data.emoji as string, name: data.name }));

  return (
    <StickyNote
      ideaId={ideaId}
      topicBackgroundColor={topicBackgroundColor}
      topics={topics}
      onClick={() => onSelect(ideaId)}
      centeredIdeaId={centeredIdeaId}
      showReactions={true}
    />
  );
};

export default IdeaNoteRow;
