import React, { useMemo, useState } from 'react';

import Button from 'design-system/Button';
import { TagListRow } from 'design-system/TagList';

import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import tagsSectionMessages from '../messages';
import TagActions from '../TagActions';
import { getSiblings } from '../utils';

import messages from './messages';
import styles from './TagGroup.module.css';
import 'design-system/tokens.css';

interface Props {
  topic: IInputTopicData;
  allTopics: IInputTopicData[];
  isSelected: boolean;
  onSelectionChange: (isSelected: boolean) => void;
  showsSelection: boolean;
  canAddSubtopics: boolean;
  deleteDisabledReason?: string;
  onAddSubtopic: () => void;
  onEdit: (topic: IInputTopicData) => void;
  onDelete: (topic: IInputTopicData) => void;
}

const TagGroup = ({
  topic,
  allTopics,
  isSelected,
  onSelectionChange,
  showsSelection,
  canAddSubtopics,
  deleteDisabledReason,
  onAddSubtopic,
  onEdit,
  onDelete,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const [opened, setOpened] = useState(false);

  const subtopics = useMemo(
    () => getSiblings(allTopics, topic.id),
    [allTopics, topic.id]
  );

  const tagName = localize(topic.attributes.title_multiloc);
  const collapsible = canAddSubtopics || subtopics.length > 0;
  const subtopicsId = `tag-subtopics-${topic.id}`;

  return (
    <div>
      <TagListRow
        title={<T value={topic.attributes.title_multiloc} />}
        meta={
          subtopics.length > 0
            ? formatMessage(messages.subtagCount, { count: subtopics.length })
            : undefined
        }
        isSelected={isSelected}
        onSelectionChange={onSelectionChange}
        selectLabel={formatMessage(tagsSectionMessages.selectTag, { tagName })}
        showsSelection={showsSelection}
        expand={
          collapsible
            ? {
                isExpanded: opened,
                onToggle: () => setOpened(!opened),
                label: formatMessage(messages.toggleSubtags, { tagName }),
                controls: subtopicsId,
              }
            : undefined
        }
        actions={
          <TagActions
            deleteDisabledReason={deleteDisabledReason}
            onEdit={() => onEdit(topic)}
            onDelete={() => onDelete(topic)}
          />
        }
      />
      {collapsible && opened && (
        <div id={subtopicsId}>
          {subtopics.map((subtopic) => (
            <TagListRow
              key={subtopic.id}
              isNested
              title={<T value={subtopic.attributes.title_multiloc} />}
              actions={
                <TagActions
                  onEdit={() => onEdit(subtopic)}
                  onDelete={() => onDelete(subtopic)}
                />
              }
            />
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
