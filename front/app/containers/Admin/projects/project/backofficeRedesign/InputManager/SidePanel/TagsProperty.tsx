import React from 'react';

import { Key, TagGroup, TagList } from 'react-aria-components';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { ManagerType } from 'components/admin/PostManager';

import { ListBoxOption } from 'design-system/ListBox';
import { DialogTrigger } from 'design-system/Popover';
import { Tag, TagAdd } from 'design-system/TagGroup';
import TagPicker from 'design-system/TagPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import usePickerOptions from '../usePickerOptions';
import { topicIds } from '../utils';

import PropertyRow from './PropertyRow';
import styles from './SidePanel.module.css';

interface Props {
  idea: IIdeaData;
  type: ManagerType;
}

const TagsProperty = ({ idea, type }: Props) => {
  const { formatMessage } = useIntl();
  const { tagOptions } = usePickerOptions(
    type,
    idea.relationships.project.data.id
  );
  const { mutate: updateIdea } = useUpdateIdea();
  const selected = topicIds(idea);
  const label = formatMessage(messages.filterTags);

  const saveTags = (tagIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { topic_ids: tagIds } });

  const handleRemove = (keys: Set<Key>) =>
    saveTags(selected.filter((id) => !keys.has(id)));

  const handleSelectionChange = (keys: Set<Key>) => {
    const added = tagOptions
      .map((option) => option.value)
      .filter((tagId) => keys.has(tagId) && !selected.includes(tagId));
    saveTags([...selected.filter((id) => keys.has(id)), ...added]);
  };

  return (
    <PropertyRow label={label}>
      {/* The design-system TagGroup always shows its label; this row draws it on the left. */}
      <TagGroup
        aria-label={label}
        onRemove={handleRemove}
        className={styles.tagGroup}
      >
        <TagList className={styles.tagList}>
          {tagOptions
            .filter((option) => selected.includes(option.value))
            .map((option) => (
              <Tag key={option.value} id={option.value}>
                {option.label}
              </Tag>
            ))}
        </TagList>
      </TagGroup>
      <DialogTrigger>
        <TagAdd>{formatMessage(messages.addTag)}</TagAdd>
        <TagPicker
          aria-label={label}
          items={tagOptions.map((option) => ({
            id: option.value,
            label: option.label,
          }))}
          selectedKeys={new Set(selected)}
          onSelectionChange={handleSelectionChange}
        >
          {(tag) => <ListBoxOption id={tag.id}>{tag.label}</ListBoxOption>}
        </TagPicker>
      </DialogTrigger>
    </PropertyRow>
  );
};

export default TagsProperty;
