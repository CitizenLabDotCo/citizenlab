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

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useLocalize from 'hooks/useLocalize';

import topicsMessages from 'containers/Admin/projects/project/topics/messages';
import useInputTopicsEditor from 'containers/Admin/projects/project/topics/useInputTopicsEditor';

import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

import SortableTag, { ROOT_TAG_TYPE } from './SortableTag';
import TagGroup from './TagGroup';
import useSortableTags from './useSortableTags';

interface Props {
  projectId: string;
}

const TagsSection = ({ projectId }: Props) => {
  const { formatMessage } = useIntl();
  const { data: authUser } = useAuthUser();
  const nestedInputTopicsActive = useFeatureFlag({
    name: 'nested_input_topics',
  });
  const {
    inputTopics,
    isLastRootTopic,
    openAdd,
    openAddSubtopic,
    openEdit,
    openDelete,
    modals,
  } = useInputTopicsEditor(projectId, 'bo');
  const localize = useLocalize();

  const rootTopics = useMemo(
    () =>
      (inputTopics?.data ?? []).filter(
        ({ attributes }) => attributes.depth === 0
      ),
    [inputTopics]
  );
  const { ordered, moveRow, dropRow } = useSortableTags(projectId, rootTopics);

  if (!authUser || !inputTopics) return null;

  return (
    <>
      <SettingsSection
        title={formatMessage(messages.settingsCreateAndManageTags)}
        description={
          <>
            <FormattedMessage {...topicsMessages.projectTopicsDescription} />
            {isAdmin(authUser) && (
              <>
                {' '}
                <FormattedMessage
                  {...topicsMessages.defaultInputTopicsInfo}
                  values={{
                    settingsLink: (
                      <Link to="/admin/settings/topics/input">
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
      {modals}
    </>
  );
};

export default TagsSection;
