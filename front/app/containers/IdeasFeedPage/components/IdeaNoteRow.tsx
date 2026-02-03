import React from 'react';

import StickyNote from '../StickyNotes/StickyNote';
import { getTopicColor } from '../topicsColor';

interface Props {
  ideaId: string;
  topicIds: string[];
  topicEmojis: Map<string, string | null>;
  topicId?: string | null;
  parentTopicId?: string | null;
  centeredIdeaId?: string;
  onSelect: (ideaId: string) => void;
}

const IdeaNoteRow = ({
  ideaId,
  topicIds,
  topicEmojis,
  topicId,
  parentTopicId,
  centeredIdeaId,
  onSelect,
}: Props) => {
  // Use parentTopicId for color when filtering by subtopic, otherwise use the first topic
  const colorTopicId = parentTopicId || topicId || topicIds[0];
  const topicBackgroundColor = getTopicColor(colorTopicId);

  // Get emojis from all root topics associated with this idea
  const emojis = topicIds
    .map((id) => topicEmojis.get(id))
    .filter((emoji): emoji is string => emoji != null);

  return (
    <StickyNote
      ideaId={ideaId}
      topicBackgroundColor={topicBackgroundColor}
      topicEmojis={emojis}
      onClick={() => onSelect(ideaId)}
      centeredIdeaId={centeredIdeaId}
      showReactions={true}
    />
  );
};

export default IdeaNoteRow;
