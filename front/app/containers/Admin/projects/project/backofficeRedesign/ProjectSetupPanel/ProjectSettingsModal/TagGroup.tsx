import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Text,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { useDragLayer } from 'react-dnd';

import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import messages from 'containers/Admin/projects/project/backofficeRedesign/messages';
import topicsMessages from 'containers/Admin/projects/project/topics/messages';

import T from 'components/T';

import { useIntl } from 'utils/cl-intl';

import SortableTag, {
  ROOT_TAG_TYPE,
  SortableTagRenderProps,
} from './SortableTag';
import TagActions from './TagActions';
import useSortableTags from './useSortableTags';
import { getSiblings } from './useTagsDraft';

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
    <Box borderTop={isFirst ? undefined : `1px solid ${colors.grey100}`}>
      <Box
        ref={drag.rowRef}
        display="flex"
        alignItems="center"
        gap="8px"
        minHeight="44px"
        cursor="grab"
      >
        {drag.handle}
        {collapsible && (
          <Button
            buttonStyle="bo-text"
            icon={opened ? 'chevron-down' : 'chevron-right'}
            iconSize="15px"
            width="22px"
            height="22px"
            padding="0"
            ariaLabel={formatMessage(messages.toggleSubtags, {
              tagName: localize(topic.attributes.title_multiloc),
            })}
            ariaExpanded={opened}
            aria-controls={subtopicsId}
            onClick={() => setOpened(!opened)}
          />
        )}
        <Box display="flex" alignItems="center" gap="8px" flex="1" minWidth="0">
          <Text variant="boControl" fontSize="xs" m="0px">
            <T value={topic.attributes.title_multiloc} />
          </Text>
          {subtopics.length > 0 && (
            <Box
              px="8px"
              py="1px"
              borderRadius="999px"
              background={colors.grey100}
            >
              <Text variant="boMicro" m="0px">
                {subtopics.length}
              </Text>
            </Box>
          )}
        </Box>
        <TagActions
          deleteDisabled={deleteDisabled}
          onEdit={() => onEdit(topic)}
          onDelete={() => onDelete(topic)}
        />
      </Box>
      {collapsible && opened && !rootDragging && (
        <Box
          id={subtopicsId}
          ml="10px"
          mb="8px"
          pl="20px"
          borderLeft={`2px solid ${colors.grey200}`}
        >
          {ordered.map((subtopic, index) => (
            <SortableTag
              key={subtopic.id}
              id={subtopic.id}
              index={index}
              type={`tag-${topic.id}`}
              dragLabel={formatMessage(messages.reorderTag, {
                tagName: localize(subtopic.attributes.title_multiloc),
              })}
              moveRow={moveRow}
              dropRow={dropRow}
              cancelDrag={cancelDrag}
            >
              {({ rowRef, handle }) => (
                <Box
                  ref={rowRef}
                  display="flex"
                  alignItems="center"
                  gap="8px"
                  minHeight="44px"
                  cursor="grab"
                  borderTop={
                    index > 0 ? `1px solid ${colors.grey100}` : undefined
                  }
                >
                  {handle}
                  <Box flex="1" minWidth="0">
                    <Text variant="boControl" m="0px">
                      <T value={subtopic.attributes.title_multiloc} />
                    </Text>
                  </Box>
                  <TagActions
                    onEdit={() => onEdit(subtopic)}
                    onDelete={() => onDelete(subtopic)}
                  />
                </Box>
              )}
            </SortableTag>
          ))}
          {canAddSubtopics && (
            <Box display="flex">
              <Button
                buttonStyle="bo-text"
                icon="plus"
                iconSize="14px"
                width="auto"
                fontSize={`${fontSizes.xs}px`}
                onClick={onAddSubtopic}
              >
                {formatMessage(topicsMessages.addSubtopic)}
              </Button>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default TagGroup;
