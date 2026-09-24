import React from 'react';

import { Box, Checkbox, colors, Text } from '@citizenlab/cl2-component-library';

import { IIdeaStatusData } from 'api/idea_statuses/types';
import { IIdeaData } from 'api/ideas/types';
import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import Engagement from './Engagement';
import messages from './messages';
import RespondedBadge from './RespondedBadge';
import StatusChip from './StatusChip';
import TagChip from './TagChip';
import { isAwaitingReply } from './utils';

const MAX_TAGS = 2;

interface Props {
  idea: IIdeaData;
  statuses: IIdeaStatusData[];
  topics: IInputTopicData[];
  assigneeName?: string;
  selecting: boolean;
  selected: boolean;
  open: boolean;
  onToggleSelected: () => void;
  onOpen: () => void;
}

const IdeaListRow = ({
  idea,
  statuses,
  topics,
  assigneeName,
  selecting,
  selected,
  open,
  onToggleSelected,
  onOpen,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { attributes, relationships } = idea;

  const title = localize(attributes.title_multiloc);
  const status = statuses.find(
    (status) => status.id === relationships.idea_status.data?.id
  );
  const topicIds = (relationships.input_topics?.data ?? []).map(
    (topic) => topic.id
  );
  const ideaTopics = topics.filter((topic) => topicIds.includes(topic.id));
  const responded = !isAwaitingReply(idea, statuses);

  return (
    <Box
      display="flex"
      gap="12px"
      py="14px"
      px="8px"
      borderBottom={`1px solid ${colors.grey200}`}
      borderLeft={`3px solid ${open ? colors.teal500 : 'transparent'}`}
      bgColor={selected || open ? colors.grey50 : undefined}
      className="e2e-idea-manager-idea-row"
    >
      {selecting && (
        <Box pt="2px">
          <Checkbox
            checked={selected}
            onChange={onToggleSelected}
            ariaLabel={formatMessage(messages.selectIdea, { title })}
          />
        </Box>
      )}

      <Box
        as="button"
        type="button"
        onClick={onOpen}
        flexGrow={1}
        minWidth="0"
        display="flex"
        gap="16px"
        style={{ cursor: 'pointer', textAlign: 'left' }}
      >
        <Box flexGrow={1} minWidth="0">
          <Text m="0" fontSize="base" color="textPrimary">
            {title}
          </Text>

          <Box display="flex" flexWrap="wrap" gap="6px" mt="10px">
            {status && <StatusChip status={status} />}
            <TagChip dashed={!assigneeName}>
              {assigneeName ?? formatMessage(messages.unassigned)}
            </TagChip>
            {ideaTopics.slice(0, MAX_TAGS).map((topic) => (
              <TagChip key={topic.id}>
                {localize(topic.attributes.title_multiloc)}
              </TagChip>
            ))}
            {ideaTopics.length > MAX_TAGS && (
              <TagChip>+{ideaTopics.length - MAX_TAGS}</TagChip>
            )}
            {responded && <RespondedBadge />}
          </Box>
        </Box>

        <Box flexShrink={0}>
          <Engagement idea={idea} direction="column" />
        </Box>
      </Box>
    </Box>
  );
};

export default IdeaListRow;
