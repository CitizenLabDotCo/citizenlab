import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Icon,
  Input,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { IInputTopicData } from 'api/input_topics/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocale from 'hooks/useLocale';
import useLocalize from 'hooks/useLocalize';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import InputTopicModal, {
  InputTopicFormValues,
} from 'containers/Admin/projects/project/topics/InputTopicModal';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import Modal from 'components/UI/Modal';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import SortableTag, { ROOT_TAG_TYPE } from './SortableTag';
import TagGroup from './TagGroup';
import useSortableTags from './useSortableTags';
import { TagsDraft } from './useTagsDraft';
import { getSiblings } from './utils';

const TOPICS_SETTINGS_PATH = '/admin/settings/topics/input';

interface Props {
  draft: TagsDraft;
}

// Who the edit modal is for: an existing tag, or a new (sub)tag.
type Editing = { topic: IInputTopicData } | { topic: null; parentId?: string };

const TagsSection = ({ draft }: Props) => {
  const { formatMessage } = useIntl();
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [name, setName] = useState('');
  const add = () => {
    if (!name.trim()) return;
    draft.addTag({
      title_multiloc: { [locale]: name.trim() },
      description_multiloc: {},
    });
    setName('');
  };
  const canAccessTopicsSettings = usePermission({
    action: 'access',
    item: { type: 'route', path: TOPICS_SETTINGS_PATH },
  });
  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });
  const localize = useLocalize();
  const [editing, setEditing] = useState<Editing | null>(null);
  const [topicToDelete, setTopicToDelete] = useState<IInputTopicData | null>(
    null
  );

  const { tags } = draft;
  const rootTopics = useMemo(() => getSiblings(tags ?? []), [tags]);
  const { ordered, moveRow, dropRow, cancelDrag } = useSortableTags(
    rootTopics,
    draft.reorder
  );

  if (!tags) return null;

  const isLastRootTopic = rootTopics.length === 1;
  const deleteHasSubtags =
    !!topicToDelete && getSiblings(tags, topicToDelete.id).length > 0;

  const saveTopic = (values: InputTopicFormValues) => {
    if (!editing) return;

    if (editing.topic) {
      draft.updateTag(editing.topic.id, values);
    } else {
      draft.addTag(values, editing.parentId);
    }
  };

  const confirmDelete = () => {
    if (topicToDelete) draft.removeTag(topicToDelete.id);
    setTopicToDelete(null);
  };

  return (
    <>
      <SettingsSection
        title={formatMessage(messages.settingsCreateAndManageTags)}
        titleVariant="label"
        description={
          <>
            <FormattedMessage {...topicsMessages.projectTopicsDescription} />
            {canAccessTopicsSettings && (
              <>
                {' '}
                <FormattedMessage
                  {...topicsMessages.defaultInputTopicsInfo}
                  values={{
                    settingsLink: (
                      <Link to={TOPICS_SETTINGS_PATH}>
                        <FormattedMessage
                          {...topicsMessages.defaultInputTopicsSettings}
                        />
                      </Link>
                    ),
                  }}
                />
              </>
            )}
          </>
        }
      >
        <Box display="flex" alignItems="center" gap="8px" mb="8px">
          <Icon
            name="info-outline"
            width="14px"
            height="14px"
            fill={colors.coolGrey500}
          />
          <Text variant="boMicro" color="coolGrey500" lineHeight="1.5" m="0px">
            {formatMessage(messages.tagsRequiredInfo)}
          </Text>
        </Box>
        <Box mb="12px">
          <Input
            type="search"
            variant="bo"
            value={search}
            onChange={setSearch}
            ariaLabel={formatMessage(messages.searchTags)}
            placeholder={formatMessage(messages.searchTags)}
          />
        </Box>
        <DndProvider backend={HTML5Backend}>
          {ordered.map((topic, index) => {
            const matches = [topic, ...getSiblings(tags, topic.id)].some(
              (tag) =>
                localize(tag.attributes.title_multiloc)
                  .toLocaleLowerCase()
                  .includes(search.toLocaleLowerCase())
            );
            if (!matches) return null;
            return (
              <SortableTag
                key={topic.id}
                id={topic.id}
                index={index}
                type={ROOT_TAG_TYPE}
                dragLabel={formatMessage(messages.reorderTag, {
                  tagName: localize(topic.attributes.title_multiloc),
                })}
                moveRow={moveRow}
                dropRow={dropRow}
                cancelDrag={cancelDrag}
              >
                {(drag) => (
                  <TagGroup
                    topic={topic}
                    allTopics={tags}
                    drag={drag}
                    canAddSubtopics={nestedInputTopicsActive}
                    deleteDisabled={isLastRootTopic}
                    isFirst={index === 0}
                    onAddSubtopic={() =>
                      setEditing({ topic: null, parentId: topic.id })
                    }
                    onEdit={(topic) => setEditing({ topic })}
                    onDelete={setTopicToDelete}
                    onReorder={draft.reorder}
                  />
                )}
              </SortableTag>
            );
          })}
        </DndProvider>
        <Box
          position="sticky"
          bottom="0"
          background={colors.white}
          pt="12px"
          pb="8px"
          display="flex"
          gap="8px"
        >
          <Box flexGrow={1}>
            <Input
              id="phase-add-input-tag"
              type="text"
              variant="bo"
              value={name}
              onChange={setName}
              placeholder={formatMessage(messages.addTagPlaceholder)}
              ariaLabel={formatMessage(messages.addTagPlaceholder)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault();
                  add();
                }
              }}
            />
          </Box>
          <Button
            buttonStyle="bo-secondary"
            icon="plus"
            disabled={!name.trim()}
            onClick={add}
          >
            {formatMessage(messages.settingsAddTag)}
          </Button>
        </Box>
      </SettingsSection>
      <Modal
        variant="bo"
        opened={!!topicToDelete}
        close={() => setTopicToDelete(null)}
        width={540}
        header={<FormattedMessage {...topicsMessages.confirmHeader} />}
        footer={
          <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
            <Button
              buttonStyle="bo-secondary"
              width="auto"
              onClick={() => setTopicToDelete(null)}
            >
              <FormattedMessage {...topicsMessages.cancel} />
            </Button>
            <Button
              buttonStyle="bo-delete"
              width="auto"
              onClick={confirmDelete}
              id="e2e-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...topicsMessages.delete} />
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text variant="boControl" m="0px">
            <FormattedMessage
              {...(deleteHasSubtags
                ? topicsMessages.deleteInputTopicWithChildrenConfirmation
                : topicsMessages.deleteInputTopicConfirmation)}
            />
          </Text>
        </Box>
      </Modal>
      <InputTopicModal
        topic={editing?.topic ?? null}
        parentId={editing && !editing.topic ? editing.parentId : undefined}
        opened={!!editing}
        close={() => setEditing(null)}
        onSubmit={saveTopic}
        variant="bo"
      />
    </>
  );
};

export default TagsSection;
