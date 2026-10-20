import React, { useMemo } from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import InputTopicModal from 'containers/Admin/projects/project/topics/InputTopicModal';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';
import useInputTopicsEditor from 'containers/Admin/projects/project/topics/useInputTopicsEditor';

import Modal from 'components/UI/Modal';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { usePermission } from 'utils/permissions';

import messages from '../../messages';

import SortableTag, { ROOT_TAG_TYPE } from './SortableTag';
import TagGroup from './TagGroup';
import useSortableTags from './useSortableTags';

const TOPICS_SETTINGS_PATH = '/admin/settings/topics/input';

interface Props {
  projectId: string;
}

const TagsSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const canAccessTopicsSettings = usePermission({
    action: 'access',
    item: { type: 'route', path: TOPICS_SETTINGS_PATH },
  });
  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });
  const {
    inputTopics,
    isLastRootTopic,
    openAdd,
    openAddSubtopic,
    openEdit,
    closeEditModal,
    showEditModal,
    topicToEdit,
    parentIdForNewTopic,
    openDelete,
    closeDeleteModal,
    confirmDelete,
    topicToDelete,
    deleteMessage,
    isDeleting,
  } = useInputTopicsEditor(projectId);
  const localize = useLocalize();

  const rootTopics = useMemo(
    () =>
      (inputTopics?.data ?? []).filter(
        ({ attributes }) => attributes.depth === 0
      ),
    [inputTopics]
  );
  const { ordered, moveRow, dropRow, cancelDrag } = useSortableTags(
    projectId,
    rootTopics
  );

  if (!inputTopics) return null;

  return (
    <>
      <SettingsSection
        title={formatMessage(messages.settingsCreateAndManageTags)}
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
            buttonStyle="bo-secondary"
            icon="plus"
            width="auto"
            onClick={openAdd}
            id="e2e-add-input-topic-button"
          >
            {formatMessage(messages.settingsAddTag)}
          </Button>
        }
      >
        {isLastRootTopic && (
          <Box display="flex" alignItems="center" gap="6px" mb="4px">
            <Icon
              name="info-outline"
              width="14px"
              height="14px"
              fill={colors.coolGrey500}
            />
            <Text variant="boMicro" color="coolGrey500" m="0px">
              {formatMessage(topicsMessages.lastTopicWarning)}
            </Text>
          </Box>
        )}
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
                  projectId={projectId}
                  topic={topic}
                  allTopics={inputTopics.data}
                  drag={drag}
                  canAddSubtopics={nestedInputTopicsActive}
                  deleteDisabled={isLastRootTopic}
                  isFirst={index === 0}
                  onAddSubtopic={() => openAddSubtopic(topic.id)}
                  onEdit={openEdit}
                  onDelete={openDelete}
                />
              )}
            </SortableTag>
          ))}
        </DndProvider>
      </SettingsSection>
      <Modal
        variant="bo"
        opened={!!topicToDelete}
        close={closeDeleteModal}
        width={540}
        header={<FormattedMessage {...topicsMessages.confirmHeader} />}
        footer={
          <Box display="flex" justifyContent="flex-end" gap="8px" w="100%">
            <Button
              buttonStyle="bo-secondary"
              width="auto"
              onClick={closeDeleteModal}
            >
              <FormattedMessage {...topicsMessages.cancel} />
            </Button>
            <Button
              buttonStyle="bo-delete"
              width="auto"
              onClick={confirmDelete}
              processing={isDeleting}
              id="e2e-input-topic-delete-confirmation-button"
            >
              <FormattedMessage {...topicsMessages.delete} />
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text variant="boControl" m="0px">
            <FormattedMessage {...deleteMessage} />
          </Text>
        </Box>
      </Modal>
      <InputTopicModal
        projectId={projectId}
        topic={topicToEdit}
        parentId={parentIdForNewTopic}
        opened={showEditModal}
        close={closeEditModal}
        variant="bo"
      />
    </>
  );
};

export default TagsSection;
