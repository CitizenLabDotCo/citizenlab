import React, { useMemo, useState } from 'react';

import { useDragLayer } from 'react-dnd';

import Badge from 'design-system/Badge';
import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';

import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import tagsSectionMessages from '../messages';
import SortableTag, {
  ROOT_TAG_TYPE,
  SortableTagRenderProps,
} from '../SortableTag';
import TagActions from '../TagActions';
import useSortableTags from '../useSortableTags';
import { getSiblings } from '../utils';

import messages from './messages';
import styles from './TagGroup.module.css';
import 'design-system/tokens.css';

interface Props {
  topic: IInputTopicData;
  allTopics: IInputTopicData[];
  drag: SortableTagRenderProps;
  canAddSubtopics: boolean;
  deleteDisabled: boolean;
  isFirst: boolean;
  onAddSubtopic: () => void;
  onEdit: (topic: IInputTopicData) => void;
  onDelete: (topic: IInputTopicData) => void;
  onReorder: (subtopics: IInputTopicData[]) => void;
}

const TagGroup = ({
  topic,
  allTopics,
  drag,
  canAddSubtopics,
  deleteDisabled,
  isFirst,
  onAddSubtopic,
  onEdit,
  onDelete,
  onReorder,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [opened, setOpened] = useState(false);
  const rootDragging = useDragLayer(
    (monitor) => monitor.isDragging() && monitor.getItemType() === ROOT_TAG_TYPE
  );

  const subtopics = useMemo(
    () => getSiblings(allTopics, topic.id),
    [allTopics, topic.id]
  );
  const { ordered, moveRow, dropRow, cancelDrag } = useSortableTags(
    subtopics,
    onReorder
  );

  const collapsible = canAddSubtopics || subtopics.length > 0;
  const subtopicsId = `tag-subtopics-${topic.id}`;

  return (
    <div className={isFirst ? undefined : styles.divided}>
      <div ref={drag.rowRef} className={styles.row}>
        {drag.handle}
        {collapsible && (
          <IconButton
            size={24}
            icon={opened ? 'chevron-down-16' : 'chevron-right-16'}
            aria-label={formatMessage(messages.toggleSubtags, {
              tagName: localize(topic.attributes.title_multiloc),
            })}
            aria-expanded={opened}
            aria-controls={subtopicsId}
            onPress={() => setOpened(!opened)}
          />
        )}
        <div className={styles.title}>
          <span className={styles.name}>
            <T value={topic.attributes.title_multiloc} />
          </span>
          {subtopics.length > 0 && <Badge use="note">{subtopics.length}</Badge>}
        </div>
        <TagActions
          deleteDisabled={deleteDisabled}
          onEdit={() => onEdit(topic)}
          onDelete={() => onDelete(topic)}
        />
      </div>
      {collapsible && opened && !rootDragging && (
        <div id={subtopicsId} className={styles.subtopics}>
          {ordered.map((subtopic, index) => (
            <SortableTag
              key={subtopic.id}
              id={subtopic.id}
              index={index}
              type={`tag-${topic.id}`}
              dragLabel={formatMessage(tagsSectionMessages.reorderTag, {
                tagName: localize(subtopic.attributes.title_multiloc),
              })}
              moveRow={moveRow}
              dropRow={dropRow}
              cancelDrag={cancelDrag}
            >
              {({ rowRef, handle }) => (
                <div
                  ref={rowRef}
                  className={`${styles.row} ${index > 0 ? styles.divided : ''}`}
                >
                  {handle}
                  <span className={`${styles.title} ${styles.name}`}>
                    <T value={subtopic.attributes.title_multiloc} />
                  </span>
                  <TagActions
                    onEdit={() => onEdit(subtopic)}
                    onDelete={() => onDelete(subtopic)}
                  />
                </div>
              )}
            </SortableTag>
          ))}
          {canAddSubtopics && (
            <div className={styles.addSubtopic}>
              <Button
                variant="quiet"
                size={28}
                icon="plus-14"
                onPress={onAddSubtopic}
              >
                {formatMessage(topicsMessages.addSubtopic)}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagGroup;
