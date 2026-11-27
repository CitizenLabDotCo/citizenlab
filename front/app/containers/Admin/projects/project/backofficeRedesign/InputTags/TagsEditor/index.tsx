import React, { useMemo, useState } from 'react';

import Button from 'design-system/Button';
import Divider from 'design-system/Divider';
import SearchField from 'design-system/SearchField';
import { TagListBar } from 'design-system/TagList';
import TextField from 'design-system/TextField';

import { IInputTopicData } from 'api/input_topics/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import InputTopicModal, {
  InputTopicFormValues,
} from 'containers/Admin/projects/project/topics/InputTopicModal';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import TagGroup from './TagGroup';
import styles from './TagsSection.module.css';
import { TagsDraft } from './useTagsDraft';
import { getSiblings } from './utils';
import 'design-system/tokens.css';

interface Props {
  draft: TagsDraft;
}

// Who the edit modal is for: an existing tag, or a new (sub)tag.
type Editing = { topic: IInputTopicData } | { topic: null; parentId?: string };

const TagsSection = ({ draft }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const localize = useLocalize();
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<Editing | null>(null);
  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });

  const { tags } = draft;
  const rootTopics = useMemo(() => getSiblings(tags ?? []), [tags]);

  if (!tags) return null;

  const add = () => {
    if (!name.trim()) return;
    draft.addTag({
      title_multiloc: { [locale]: name.trim() },
      description_multiloc: {},
    });
    setName('');
  };

  const matchesSearch = (topic: IInputTopicData) =>
    [topic, ...getSiblings(tags, topic.id)].some((tag) =>
      localize(tag.attributes.title_multiloc)
        .toLocaleLowerCase()
        .includes(search.toLocaleLowerCase())
    );
  const shown = rootTopics.filter(matchesSearch);
  const shownSelected = shown.filter(({ id }) => selected.has(id));
  const allSelected = shown.length > 0 && shownSelected.length === shown.length;
  // At least one tag must stay.
  const deletesEverything = shownSelected.length >= rootTopics.length;

  const select = (id: string, isSelected: boolean) =>
    setSelected((current) => {
      const next = new Set(current);
      if (isSelected) next.add(id);
      else next.delete(id);
      return next;
    });

  const remove = (ids: string[]) => {
    draft.removeTags(ids);
    setSelected(new Set());
  };

  const saveTopic = (values: InputTopicFormValues) => {
    if (!editing) return;

    if (editing.topic) {
      draft.updateTag(editing.topic.id, values);
    } else {
      draft.addTag(values, editing.parentId);
    }
  };

  const barText =
    shownSelected.length > 0
      ? formatMessage(messages.selectedCount, { count: shownSelected.length })
      : draft.deletedCount > 0
      ? formatMessage(messages.deletedCount, { count: draft.deletedCount })
      : formatMessage(messages.tagCount, { count: rootTopics.length });

  const barAction =
    shownSelected.length > 0 ? (
      <Button
        variant="quiet"
        size={28}
        disabledReason={
          deletesEverything
            ? formatMessage(messages.tagsRequiredInfo)
            : undefined
        }
        onPress={() => remove(shownSelected.map(({ id }) => id))}
      >
        {formatMessage(topicsMessages.delete)}
      </Button>
    ) : draft.deletedCount > 0 ? (
      <Button variant="quiet" size={28} onPress={draft.undoDelete}>
        {formatMessage(messages.undo)}
      </Button>
    ) : undefined;

  return (
    <>
      <section
        className={styles.section}
        aria-label={formatMessage(messages.settingsCreateAndManageTags)}
      >
        <Divider />
        <div className={styles.search}>
          <SearchField
            size={36}
            width="full"
            aria-label={formatMessage(messages.searchTags)}
            placeholder={formatMessage(messages.searchTags)}
            value={search}
            onChange={setSearch}
          />
        </div>
        <TagListBar
          isSelected={allSelected}
          isIndeterminate={shownSelected.length > 0 && !allSelected}
          onSelectAll={(isSelected) =>
            setSelected(new Set(isSelected ? shown.map(({ id }) => id) : []))
          }
          selectAllLabel={formatMessage(messages.selectAllTags)}
          action={barAction}
        >
          {barText}
        </TagListBar>
        <div className={styles.list}>
          {shown.map((topic) => (
            <TagGroup
              key={topic.id}
              topic={topic}
              allTopics={tags}
              isSelected={selected.has(topic.id)}
              onSelectionChange={(isSelected) =>
                select(topic.id, isSelected)
              }
              showsSelection={selected.size > 0}
              canAddSubtopics={nestedInputTopicsActive}
              deleteDisabledReason={
                rootTopics.length === 1
                  ? formatMessage(messages.tagsRequiredInfo)
                  : undefined
              }
              onAddSubtopic={() =>
                setEditing({ topic: null, parentId: topic.id })
              }
              onEdit={(topic) => setEditing({ topic })}
              onDelete={(topic) => remove([topic.id])}
            />
          ))}
        </div>
        <div className={styles.footer}>
          <Divider />
          {/* A form, so Enter in the name field adds the tag. */}
          <form
            className={styles.addRow}
            onSubmit={(event) => {
              event.preventDefault();
              add();
            }}
          >
            <div className={styles.addField}>
              <TextField
                id="phase-add-input-tag"
                aria-label={formatMessage(messages.addTagPlaceholder)}
                placeholder={formatMessage(messages.addTagPlaceholder)}
                value={name}
                onChange={setName}
              />
            </div>
            <Button
              type="submit"
              variant="secondary"
              size={28}
              icon="plus-14"
              aria-label={formatMessage(messages.settingsAddTag)}
              isDisabled={!name.trim()}
            />
          </form>
        </div>
      </section>
      <InputTopicModal
        topic={editing?.topic ?? null}
        parentId={editing && !editing.topic ? editing.parentId : undefined}
        opened={!!editing}
        close={() => setEditing(null)}
        onSubmit={saveTopic}
        variant="panel"
      />
    </>
  );
};

export default TagsSection;
