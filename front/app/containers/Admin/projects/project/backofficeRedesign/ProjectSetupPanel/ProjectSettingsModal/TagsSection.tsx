import React from 'react';

import {
  Box,
  Button,
  Text,
  fontSizes,
} from '@citizenlab/cl2-component-library';

import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import IndentedSortableRow from 'containers/Admin/projects/project/topics/IndentedSortableRow';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';
import useInputTopicsEditor from 'containers/Admin/projects/project/topics/useInputTopicsEditor';

import SortableList from 'components/admin/ResourceList/SortableList';
import T from 'components/T';
import SettingsSection from 'components/UI/SettingsModal/SettingsSection';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isAdmin } from 'utils/permissions/roles';

import messages from '../../messages';

import TagActionButton from './TagActionButton';

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
    sortableItems,
    isLastRootTopic,
    handleReorder,
    openAdd,
    openAddSubtopic,
    openEdit,
    openDelete,
    modals,
  } = useInputTopicsEditor(projectId);

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
          <Text variant="boMicro" color="coolGrey500" m="0px" mb="4px">
            {formatMessage(topicsMessages.lastTopicWarning)}
          </Text>
        )}
        <SortableList items={sortableItems} onReorder={handleReorder}>
          {({ itemsList, handleDragRow, handleDropRow }) => (
            <>
              {itemsList.map((item, index) => {
                // Dragging reorders itemsList before the server confirms it.
                const topic = sortableItems.find(({ id }) => id === item.id);
                if (!topic) return null;

                const isRootTopic = topic.attributes.depth === 0;

                return (
                  <IndentedSortableRow
                    key={item.id}
                    id={item.id}
                    depth={topic.attributes.depth}
                    index={index}
                    isLastItem={index === itemsList.length - 1}
                    moveRow={handleDragRow}
                    dropRow={handleDropRow}
                    disableNestedStyles
                  >
                    <Box flex="1" minWidth="0" ml="8px">
                      <Text variant="boMicro" color="textPrimary" m="0px">
                        <T value={topic.attributes.title_multiloc} />
                      </Text>
                    </Box>
                    <Box display="flex" alignItems="center" gap="6px">
                      {nestedInputTopicsActive && isRootTopic && (
                        <Button
                          buttonStyle="bo-text"
                          icon="plus"
                          width="auto"
                          fontSize={`${fontSizes.xs}px`}
                          onClick={() => openAddSubtopic(topic.id)}
                        >
                          {formatMessage(topicsMessages.addSubtopic)}
                        </Button>
                      )}
                      <TagActionButton
                        iconName="edit"
                        label={formatMessage(topicsMessages.edit)}
                        onClick={() => openEdit(topic)}
                      />
                      <TagActionButton
                        iconName="delete"
                        label={formatMessage(topicsMessages.delete)}
                        disabled={isRootTopic && isLastRootTopic}
                        onClick={() => openDelete(topic)}
                      />
                    </Box>
                  </IndentedSortableRow>
                );
              })}
            </>
          )}
        </SortableList>
      </SettingsSection>
      {modals}
    </>
  );
};

export default TagsSection;
