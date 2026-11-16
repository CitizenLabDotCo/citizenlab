import React, { useMemo, useState } from 'react';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import { IInputTopicData } from 'api/input_topics/types';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import SettingsSection from 'containers/Admin/projects/project/backofficeRedesign/_shared/components/SettingsModal/SettingsSection';
import InputTopicModal, {
  InputTopicFormValues,
} from 'containers/Admin/projects/project/topics/InputTopicModal';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import AlertDialog from 'design-system/AlertDialog';
import Button from 'design-system/Button';
import Icon from 'design-system/Icon';
import 'design-system/tokens.css';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { usePermission } from 'utils/permissions';

import messages from './messages';
import SortableTag, { ROOT_TAG_TYPE } from './SortableTag';
import TagGroup from './TagGroup';
import styles from './TagsSection.module.css';
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
        action={
          <Button
            variant="secondary"
            icon="plus-14"
            onPress={() => setEditing({ topic: null })}
            id="e2e-add-input-topic-button"
          >
            {formatMessage(messages.settingsAddTag)}
          </Button>
        }
      >
        <div className={styles.info}>
          <Icon name="info-16" className={styles.infoIcon} />
          <p className={styles.infoText}>
            {formatMessage(messages.tagsRequiredInfo)}
          </p>
        </div>
        <DndProvider backend={HTML5Backend}>
          {ordered.map((topic, index) => (
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
          ))}
        </DndProvider>
      </SettingsSection>
      <AlertDialog
        isOpen={!!topicToDelete}
        onOpenChange={(isOpen) => {
          if (!isOpen) setTopicToDelete(null);
        }}
        title={<FormattedMessage {...topicsMessages.confirmHeader} />}
        confirmLabel={<FormattedMessage {...topicsMessages.delete} />}
        onConfirm={confirmDelete}
        confirmId="e2e-input-topic-delete-confirmation-button"
      >
        <FormattedMessage
          {...(deleteHasSubtags
            ? topicsMessages.deleteInputTopicWithChildrenConfirmation
            : topicsMessages.deleteInputTopicConfirmation)}
        />
      </AlertDialog>
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
