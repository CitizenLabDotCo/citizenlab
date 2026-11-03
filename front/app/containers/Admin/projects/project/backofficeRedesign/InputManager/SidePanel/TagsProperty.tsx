import React from 'react';

import { IIdeaData } from 'api/ideas/types';
import useUpdateIdea from 'api/ideas/useUpdateIdea';

import { ManagerType } from 'components/admin/PostManager';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import OptionList from '../OptionList';
import TagChip from '../TagChip';
import usePickerOptions from '../usePickerOptions';
import { topicIds } from '../utils';

import PropertyMenu from './PropertyMenu';
import PropertyRow from './PropertyRow';

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

  const saveTags = (tagIds: string[]) =>
    updateIdea({ id: idea.id, requestBody: { topic_ids: tagIds } });

  const toggleTag = (tagId: string) =>
    saveTags(
      selected.includes(tagId)
        ? selected.filter((id) => id !== tagId)
        : [...selected, tagId]
    );

  return (
    <PropertyRow label={formatMessage(messages.filterTags)}>
      {tagOptions
        .filter((option) => selected.includes(option.value))
        .map((option) => (
          <TagChip
            key={option.value}
            label={option.label}
            onRemove={() => toggleTag(option.value)}
            removeLabel={formatMessage(messages.removeTag, {
              tag: option.label,
            })}
          />
        ))}
      <PropertyMenu label={formatMessage(messages.addTag)} icon="plus">
        {() => (
          <OptionList
            options={tagOptions}
            selected={selected}
            searchable
            onToggle={toggleTag}
          />
        )}
      </PropertyMenu>
    </PropertyRow>
  );
};

export default TagsProperty;
